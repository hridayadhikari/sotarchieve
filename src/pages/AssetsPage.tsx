import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AssetResource, AssetType } from '../types';
import { uploadToCloudinary } from '../lib/cloudinary';
import { ActionModal, ModalType } from '../components/ActionModal';
import { Image, Upload, Trash2, ExternalLink, Download, X, Check, Shield, Eye } from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const { assets, projects, addAsset, deleteAsset } = useData();
  const { can } = useAuth();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetResource | null>(null);

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    type: ModalType;
    confirmLabel?: string;
    onConfirm?: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [newAsset, setNewAsset] = useState<{
    name: string;
    type: AssetType;
    project_id: string | null;
  }>({
    name: '',
    type: 'Logo',
    project_id: null
  });

  const assetTypes: ('ALL' | AssetType)[] = ['ALL', 'Logo', 'Photo', 'Poster', 'Branding', 'Other'];

  const filteredAssets = assets.filter(a => {
    const matchType = filterType === 'ALL' || a.type === filterType;
    const matchProj = filterProject === 'ALL' || a.project_id === filterProject;
    return matchType && matchProj;
  });

  // Users with CREATE, EDIT, or MANAGE can upload assets
  const canCreate = can('CREATE', 'assets') || can('EDIT', 'assets') || can('MANAGE', 'assets');
  // Users with DELETE or MANAGE can delete assets
  const canDelete = can('DELETE', 'assets') || can('MANAGE', 'assets');

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !newAsset.name) return;

    try {
      const result = await uploadToCloudinary(selectedFile, 'assets', (p) => setUploadProgress(p));
      await addAsset({
        name: newAsset.name,
        type: newAsset.type,
        project_id: newAsset.project_id || null,
        cloudinary_url: result.secure_url,
        thumbnail_url: result.thumbnail_url || result.secure_url,
        public_id: result.public_id
      });
      setIsUploading(false);
      setSelectedFile(null);
      setUploadProgress(0);
      const assetName = newAsset.name;
      setNewAsset({ name: '', type: 'Logo', project_id: null });

      setActionModal({
        isOpen: true,
        title: 'Asset Uploaded Successfully',
        message: `Official asset "${assetName}" is now available in the archive.`,
        type: 'success'
      });
    } catch (err: any) {
      setUploadProgress(0);
      setActionModal({
        isOpen: true,
        title: 'Upload Failed',
        message: err.message || 'Failed to upload asset.',
        type: 'danger'
      });
    }
  };

  const handleDownload = async (asset: AssetResource) => {
    try {
      const response = await fetch(asset.cloudinary_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileExt = asset.cloudinary_url.split('.').pop()?.split('?')[0] || 'jpg';
      link.download = `${asset.name.replace(/[^a-z0-9_-]/gi, '_')}.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: open URL in new tab for direct save
      window.open(asset.cloudinary_url, '_blank');
    }
  };

  const handleDelete = (asset: AssetResource) => {
    if (!canDelete) {
      setActionModal({
        isOpen: true,
        title: 'Permission Denied',
        message: 'Only administrators or users with DELETE/MANAGE permission can delete official assets.',
        type: 'danger'
      });
      return;
    }

    setActionModal({
      isOpen: true,
      title: 'Delete Official Asset',
      message: (
        <span>
          Are you sure you want to permanently delete official asset <strong>"{asset.name}"</strong>?
        </span>
      ),
      type: 'danger',
      confirmLabel: 'Delete Asset',
      onConfirm: async () => {
        try {
          await deleteAsset(asset.id);
          setActionModal({
            isOpen: true,
            title: 'Asset Deleted',
            message: `"${asset.name}" has been removed from assets.`,
            type: 'info'
          });
        } catch (err: any) {
          setActionModal({
            isOpen: true,
            title: 'Delete Failed',
            message: err.message || 'Could not delete asset.',
            type: 'danger'
          });
        }
      }
    });
  };


  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image size={20} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Official Brand Assets</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Controlled visual repository: SOT Logos, posters, typography marks, and official photographs.
          </p>
        </div>

        {canCreate && (
          <button className="btn btn-primary" onClick={() => setIsUploading(true)} title="Upload Official Asset">
            <Upload size={14} /> <span className="hide-on-mobile-text">Upload Asset</span>
          </button>
        )}
      </div>

      {!canCreate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <Shield size={14} style={{ color: 'var(--text-muted)' }} />
          <span>You have <strong>VIEW ONLY</strong> access to official brand assets. Uploading and asset management is restricted to administrators and authorized members.</span>
        </div>
      )}

      {/* Upload Asset Modal */}
      {isUploading && (
        <div className="modal-overlay" onClick={() => !uploadProgress && setIsUploading(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Upload Controlled Official Asset</h2>
              </div>
              <button className="btn-ghost btn-sm" onClick={() => !uploadProgress && setIsUploading(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ border: '2px dashed var(--border-color)', padding: '28px 20px', textAlign: 'center', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                <input
                  type="file"
                  required
                  accept="image/*,.svg,.pdf"
                  id="asset-file-input"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      if (!newAsset.name) setNewAsset(prev => ({ ...prev, name: f.name.replace(/\.[^/.]+$/, "") }));
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <label htmlFor="asset-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Upload size={28} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>
                    {selectedFile ? selectedFile.name : 'Choose Logo, Poster, or Official Photo'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Stored securely under sot-archive/assets/'}
                  </span>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Asset Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. SOT Master Red & Black Emblem (Vector SVG)"
                  value={newAsset.name}
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Asset Classification</label>
                  <select
                    className="select"
                    value={newAsset.type}
                    onChange={e => setNewAsset({ ...newAsset, type: e.target.value as any })}
                  >
                    <option value="Logo">Official Logo</option>
                    <option value="Photo">Official Photo</option>
                    <option value="Poster">Exhibition Poster</option>
                    <option value="Branding">Brand Guidelines Art</option>
                    <option value="Other">Other Visual</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Project Association</label>
                  <select
                    className="select"
                    value={newAsset.project_id || ''}
                    onChange={e => setNewAsset({ ...newAsset, project_id: e.target.value || null })}
                  >
                    <option value="">Global SOT Brand</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {uploadProgress > 0 && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, background: 'var(--accent)', height: '100%', transition: 'width 0.2s' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="btn btn-ghost" disabled={uploadProgress > 0} onClick={() => setIsUploading(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!selectedFile || uploadProgress > 0}>
                  <Check size={14} /> {uploadProgress > 0 ? `Uploading (${uploadProgress}%)...` : 'Upload Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="modal-overlay" onClick={() => setPreviewAsset(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600 }}>{previewAsset.name}</h2>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <span className="badge badge-red">{previewAsset.type}</span>
                  <span className="badge badge-outline">
                    {projects.find(p => p.id === previewAsset.project_id)?.name || 'Global'}
                  </span>
                </div>
              </div>
              <button className="btn-ghost btn-sm" onClick={() => setPreviewAsset(null)}><X size={16} /></button>
            </div>

            <div style={{ background: '#0a0a0a', borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '60vh', overflow: 'hidden' }}>
              <img
                src={previewAsset.cloudinary_url}
                alt={previewAsset.name}
                style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <a
                href={previewAsset.cloudinary_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <ExternalLink size={13} /> Open Original in New Tab
              </a>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleDownload(previewAsset)}
              >
                <Download size={13} /> Download Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'center' }}>
        <select className="select" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="ALL">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select className="select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="ALL">All Asset Types</option>
          {assetTypes.filter(t => t !== 'ALL').map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Assets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {filteredAssets.map(asset => (
          <div key={asset.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{ height: '180px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', position: 'relative' }}
              onClick={() => setPreviewAsset(asset)}
              title="Click to preview"
            >
              <img
                src={asset.thumbnail_url || asset.cloudinary_url}
                alt={asset.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000000' }}
              />
            </div>

            <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge badge-red">{asset.type}</span>
                  <span className="badge badge-outline" style={{ fontSize: '9px' }}>
                    {projects.find(p => p.id === asset.project_id)?.name || 'Global'}
                  </span>
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3 }}>{asset.name}</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', marginTop: '12px', paddingTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleDownload(asset)}
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    title="Download Asset File"
                  >
                    <Download size={13} style={{ color: 'var(--accent)' }} /> <span className="hide-on-mobile-text">Download</span>
                  </button>

                  <button
                    onClick={() => setPreviewAsset(asset)}
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: '11px', padding: '4px 6px' }}
                    title="Quick Preview"
                  >
                    <Eye size={13} />
                  </button>
                </div>

                {canDelete && (
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleDelete(asset)}
                    title="Delete Official Asset"
                  >
                    <Trash2 size={13} style={{ color: 'var(--accent)' }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reusable Action / Feedback Modal */}
      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={actionModal.onConfirm}
        title={actionModal.title}
        message={actionModal.message}
        type={actionModal.type}
        confirmLabel={actionModal.confirmLabel}
      />
    </div>
  );
};

