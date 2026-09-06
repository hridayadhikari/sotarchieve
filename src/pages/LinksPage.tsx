import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LinkResource, LinkCategory } from '../types';
import { Link2, Plus, ExternalLink, Trash2, Copy, Check, X, Edit2 } from 'lucide-react';
import { ActionModal, ModalType } from '../components/ActionModal';

export const LinksPage: React.FC = () => {
  const { links, projects, addLink, updateLink, deleteLink } = useData();
  const { can } = useAuth();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkResource | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const [newLink, setNewLink] = useState<{
    title: string;
    description: string;
    url: string;
    category: LinkCategory;
    project_id: string | null;
  }>({
    title: '',
    description: '',
    url: '',
    category: 'Canva',
    project_id: null
  });

  const [editFormData, setEditFormData] = useState<{
    title: string;
    description: string;
    url: string;
    category: LinkCategory;
    project_id: string | null;
  }>({
    title: '',
    description: '',
    url: '',
    category: 'Canva',
    project_id: null
  });

  const categories: ('ALL' | LinkCategory)[] = ['ALL', 'Canva', 'Google Drive', 'Google Forms', 'Google Docs', 'Social', 'Other'];

  const filteredLinks = links.filter(l => {
    const matchCat = filterCategory === 'ALL' || l.category === filterCategory;
    const matchProj = filterProject === 'ALL' || l.project_id === filterProject;
    return matchCat && matchProj;
  });

  const canCreate = can('CREATE', 'links');

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;

    addLink({
      title: newLink.title,
      description: newLink.description,
      url: newLink.url,
      category: newLink.category,
      project_id: newLink.project_id || null
    });

    const savedTitle = newLink.title;
    setIsCreating(false);
    setNewLink({ title: '', description: '', url: '', category: 'Canva', project_id: null });

    setActionModal({
      isOpen: true,
      title: 'Link Added Successfully',
      message: `"${savedTitle}" has been saved to external resources.`,
      type: 'success'
    });
  };

  const handleStartEdit = (link: LinkResource) => {
    if (!can('EDIT', 'links', link.project_id)) {
      setActionModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'You do not have permission to edit this link.',
        type: 'danger'
      });
      return;
    }

    setEditingLink(link);
    setEditFormData({
      title: link.title,
      description: link.description || '',
      url: link.url,
      category: link.category,
      project_id: link.project_id || null
    });
  };

  const handleUpdateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink || !editFormData.title || !editFormData.url) return;

    try {
      await updateLink(editingLink.id, {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        url: editFormData.url.trim(),
        category: editFormData.category,
        project_id: editFormData.project_id || null
      });

      const updatedTitle = editFormData.title;
      setEditingLink(null);

      setActionModal({
        isOpen: true,
        title: 'Link Updated',
        message: `"${updatedTitle}" has been updated successfully.`,
        type: 'success'
      });
    } catch (err: any) {
      setActionModal({
        isOpen: true,
        title: 'Update Failed',
        message: err.message || 'Could not update link.',
        type: 'danger'
      });
    }
  };

  const handleDelete = (link: LinkResource) => {
    if (!can('DELETE', 'links', link.project_id)) {
      setActionModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'You do not have permission to delete this link.',
        type: 'danger'
      });
      return;
    }

    setActionModal({
      isOpen: true,
      title: 'Delete External Link',
      message: (
        <span>
          Are you sure you want to delete <strong>"{link.title}"</strong>?
        </span>
      ),
      type: 'danger',
      confirmLabel: 'Delete Link',
      onConfirm: async () => {
        try {
          await deleteLink(link.id);
          setActionModal({
            isOpen: true,
            title: 'Link Deleted',
            message: `"${link.title}" has been deleted.`,
            type: 'info'
          });
        } catch (err: any) {
          setActionModal({
            isOpen: true,
            title: 'Delete Failed',
            message: err.message || 'Could not delete link.',
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
            <Link2 size={20} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 700 }}>External Links & Resources</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Curated index for SOT Canva designs, Google Drives, Forms, Docs, and social handles.
          </p>
        </div>

        {canCreate && !isCreating && (
          <button className="btn btn-primary" onClick={() => setIsCreating(true)} title="Add Link">
            <Plus size={14} /> <span className="hide-on-mobile-text">Add Link</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px' }}>Index New External Link</h2>
            <button className="btn-ghost btn-sm" onClick={() => setIsCreating(false)}><X size={14} /></button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Link Title</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. LENS 5.0 Instagram Reel Master Cut"
                  value={newLink.title}
                  onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Service / Category</label>
                <select
                  className="select"
                  value={newLink.category}
                  onChange={e => setNewLink({ ...newLink, category: e.target.value as any })}
                >
                  <option value="Canva">Canva</option>
                  <option value="Google Drive">Google Drive</option>
                  <option value="Google Forms">Google Forms</option>
                  <option value="Google Docs">Google Docs</option>
                  <option value="Social">Social Media</option>
                  <option value="Other">Other Resource</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Project Association</label>
                <select
                  className="select"
                  value={newLink.project_id || ''}
                  onChange={e => setNewLink({ ...newLink, project_id: e.target.value || null })}
                >
                  <option value="">Global / SOT Wide</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Destination URL</label>
              <input
                type="url"
                required
                className="input"
                placeholder="https://..."
                value={newLink.url}
                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Description</label>
              <textarea
                rows={2}
                className="textarea"
                placeholder="What this external resource is used for..."
                value={newLink.description}
                onChange={e => setNewLink({ ...newLink, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsCreating(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><Check size={14} /> Save Link</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'center' }}>
        <select className="select" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="ALL">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select className="select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="ALL">All Services & Categories</option>
          {categories.filter(c => c !== 'ALL').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Links Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredLinks.map(link => (
          <div key={link.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-red">{link.category}</span>
                <span className="badge badge-outline" style={{ fontSize: '9px' }}>
                  {projects.find(p => p.id === link.project_id)?.name || 'Global'}
                </span>
              </div>

              <h2 style={{ fontSize: '15px', fontWeight: 600 }}>{link.title}</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                {link.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', marginTop: '16px', paddingTop: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleCopy(link.id, link.url)}
                  title="Copy Link URL"
                >
                  {copiedId === link.id ? <Check size={13} style={{ color: 'var(--accent)' }} /> : <Copy size={13} />}
                </button>
                {can('EDIT', 'links', link.project_id) && (
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleStartEdit(link)}
                    title="Edit Link"
                  >
                    <Edit2 size={13} />
                  </button>
                )}
                {can('DELETE', 'links', link.project_id) && (
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleDelete(link)}
                    title="Delete Link"
                  >
                    <Trash2 size={13} style={{ color: 'var(--accent)' }} />
                  </button>
                )}
              </div>

              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-primary"
                title="Open Link in New Tab"
              >
                <span className="hide-on-mobile-text">Open</span> <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="modal-overlay" onClick={() => setEditingLink(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={16} style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Edit External Resource Link</h2>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditingLink(null)}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleUpdateSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Link Title</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Service / Category</label>
                  <select
                    className="select"
                    value={editFormData.category}
                    onChange={e => setEditFormData({ ...editFormData, category: e.target.value as any })}
                  >
                    <option value="Canva">Canva</option>
                    <option value="Google Drive">Google Drive</option>
                    <option value="Google Forms">Google Forms</option>
                    <option value="Google Docs">Google Docs</option>
                    <option value="Social">Social Media</option>
                    <option value="Other">Other Resource</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Project Association</label>
                  <select
                    className="select"
                    value={editFormData.project_id || ''}
                    onChange={e => setEditFormData({ ...editFormData, project_id: e.target.value || null })}
                  >
                    <option value="">Global / SOT Wide</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Destination URL</label>
                <input
                  type="url"
                  required
                  className="input"
                  value={editFormData.url}
                  onChange={e => setEditFormData({ ...editFormData, url: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={2}
                  className="textarea"
                  value={editFormData.description}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingLink(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Check size={14} /> Update Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

