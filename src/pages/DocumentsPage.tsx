import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DocumentResource } from '../types';
import { uploadToCloudinary } from '../lib/cloudinary';
import { FileText, Plus, Upload, Trash2, Download, ExternalLink, X, Check } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { documents, projects, addDocument, deleteDocument } = useData();
  const { can } = useAuth();
  
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [newDoc, setNewDoc] = useState<{
    title: string;
    description: string;
    category: string;
    project_id: string | null;
  }>({
    title: '',
    description: '',
    category: 'General',
    project_id: null
  });

  const categories = ['ALL', ...Array.from(new Set(documents.map(d => d.category)))];

  const filteredDocs = documents.filter(d => {
    const matchProj = filterProject === 'ALL' || d.project_id === filterProject;
    const matchCat = filterCategory === 'ALL' || d.category === filterCategory;
    return matchProj && matchCat;
  });

  const canCreate = can('CREATE', 'documents');

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !newDoc.title) return;

    try {
      const result = await uploadToCloudinary(selectedFile, 'documents', (p) => setUploadProgress(p));
      await addDocument({
        title: newDoc.title,
        description: newDoc.description,
        category: newDoc.category,
        project_id: newDoc.project_id || null,
        file_url: result.secure_url,
        file_type: selectedFile.type || 'application/octet-stream',
        file_size: selectedFile.size
      });
      setIsUploading(false);
      setSelectedFile(null);
      setUploadProgress(0);
      setNewDoc({ title: '', description: '', category: 'General', project_id: null });
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleDownload = async (doc: DocumentResource) => {
    try {
      const response = await fetch(doc.file_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileExt = doc.file_url.split('.').pop()?.split('?')[0] || 'pdf';
      link.download = `${doc.title.replace(/[^a-z0-9_\-]/gi, '_')}.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(doc.file_url, '_blank');
    }
  };

  const handleDelete = (doc: DocumentResource) => {
    if (!can('DELETE', 'documents', doc.project_id)) {
      alert('You do not have permission to delete this document.');
      return;
    }
    if (window.confirm(`Delete document "${doc.title}"?`)) {
      deleteDocument(doc.id);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Documents & Files</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Central repository for PDFs, calibration sheets, MoUs, and Markdown files stored in Cloudinary.
          </p>
        </div>

        {canCreate && (
          <button className="btn btn-primary" onClick={() => setIsUploading(true)} title="Upload Document">
            <Upload size={14} /> <span className="hide-on-mobile-text">Upload Document</span>
          </button>
        )}
      </div>

      {/* Upload Document Modal */}
      {isUploading && (
        <div className="modal-overlay" onClick={() => !uploadProgress && setIsUploading(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Upload Document to Cloudinary</h2>
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
                  id="doc-file-input"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      if (!newDoc.title) setNewDoc(prev => ({ ...prev, title: f.name.replace(/\.[^/.]+$/, "") }));
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <label htmlFor="doc-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Upload size={28} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>
                    {selectedFile ? selectedFile.name : 'Choose PDF, Markdown, or document file'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Direct secure upload to sot-archive/documents/'}
                  </span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Document Title</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. LENS 5.0 Sponsorship MoU"
                    value={newDoc.title}
                    onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Category</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Legal, Technical, Print..."
                    value={newDoc.category}
                    onChange={e => setNewDoc({ ...newDoc, category: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Project Association</label>
                  <select
                    className="select"
                    value={newDoc.project_id || ''}
                    onChange={e => setNewDoc({ ...newDoc, project_id: e.target.value || null })}
                  >
                    <option value="">Global / SOT Wide</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={2}
                  className="textarea"
                  placeholder="What this document contains..."
                  value={newDoc.description}
                  onChange={e => setNewDoc({ ...newDoc, description: e.target.value })}
                />
              </div>

              {uploadProgress > 0 && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, background: 'var(--accent)', height: '100%', transition: 'width 0.2s' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="btn btn-ghost" disabled={uploadProgress > 0} onClick={() => setIsUploading(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!selectedFile || uploadProgress > 0}>
                  <Check size={14} /> {uploadProgress > 0 ? `Uploading (${uploadProgress}%)...` : 'Upload & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'center' }}>
        <select className="select" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="ALL">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select className="select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="ALL">All Categories</option>
          {categories.filter(c => c !== 'ALL').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Document Title</th>
              <th>Category</th>
              <th>Project</th>
              <th>Size</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map(doc => (
              <tr key={doc.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{doc.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{doc.description}</div>
                </td>
                <td><span className="badge">{doc.category}</span></td>
                <td>
                  <span className="badge badge-outline">
                    {projects.find(p => p.id === doc.project_id)?.name || 'Global'}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {new Date(doc.created_at).toLocaleDateString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="btn btn-sm btn-ghost"
                      title="Download Document"
                    >
                      <Download size={13} style={{ color: 'var(--accent)' }} /> <span className="hide-on-mobile-text">Download</span>
                    </button>
                    <a href={doc.file_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost" title="Open Original File">
                      <ExternalLink size={13} />
                    </a>
                    {can('DELETE', 'documents', doc.project_id) && (
                      <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(doc)} title="Delete Document">
                        <Trash2 size={13} style={{ color: 'var(--accent)' }} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  No documents found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
