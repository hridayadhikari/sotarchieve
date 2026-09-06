import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { KnowledgeArticle } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Plus, Edit2, Trash2, Search, X, Check, ArrowLeft } from 'lucide-react';
import { ActionModal, ModalType } from '../components/ActionModal';

export const KnowledgeBasePage: React.FC = () => {
  const { knowledge, projects, addKnowledge, updateKnowledge, deleteKnowledge } = useData();
  const { can } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedId = searchParams.get('id');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<KnowledgeArticle> | null>(null);

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

  const filteredArticles = knowledge.filter(k => {
    const matchesSearch = !searchQuery || 
      k.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      k.content_markdown.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Default to the "About Streets of Tripura" article or first article
  const aboutArticle = knowledge.find(k => k.title.toLowerCase().includes('about streets of tripura') || k.title.toLowerCase().includes('about sot'));
  const activeArticle = knowledge.find(k => k.id === selectedId) || aboutArticle || (filteredArticles.length > 0 ? filteredArticles[0] : null);

  const canCreate = can('CREATE', 'knowledge');
  const canEdit = activeArticle ? can('EDIT', 'knowledge', activeArticle.project_id) : false;
  const canDelete = activeArticle ? can('DELETE', 'knowledge', activeArticle.project_id) : false;

  const handleStartCreate = () => {
    setEditingArticle({
      title: '',
      category: 'General',
      project_id: null,
      tags: [],
      content_markdown: '# Article Title\n\nWrite documentation here in Markdown format...'
    });
    setIsEditing(true);
  };

  const handleStartEdit = (article: KnowledgeArticle) => {
    setEditingArticle({ ...article });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title || !editingArticle.content_markdown) return;

    if (editingArticle.id) {
      updateKnowledge(editingArticle.id, editingArticle);
    } else {
      addKnowledge({
        title: editingArticle.title,
        content_markdown: editingArticle.content_markdown,
        category: editingArticle.category || 'General',
        project_id: editingArticle.project_id || null,
        tags: typeof editingArticle.tags === 'string' ? (editingArticle.tags as string).split(',').map((s: string) => s.trim()) : editingArticle.tags || [],
      });
    }
    const savedTitle = editingArticle.title;
    setIsEditing(false);
    setEditingArticle(null);

    setActionModal({
      isOpen: true,
      title: 'Article Saved',
      message: `"${savedTitle}" has been saved to the Knowledge Base.`,
      type: 'success'
    });
  };

  const handleDelete = (id: string) => {
    const target = knowledge.find(k => k.id === id);
    setActionModal({
      isOpen: true,
      title: 'Delete Knowledge Article',
      message: (
        <span>
          Are you sure you want to delete <strong>"{target?.title || 'this article'}"</strong>? This will permanently remove it from the knowledge repository.
        </span>
      ),
      type: 'danger',
      confirmLabel: 'Delete Article',
      onConfirm: async () => {
        try {
          await deleteKnowledge(id);
          if (selectedId === id) setSearchParams({});
          setActionModal({
            isOpen: true,
            title: 'Article Deleted',
            message: `The article has been removed.`,
            type: 'info'
          });
        } catch (err: any) {
          setActionModal({
            isOpen: true,
            title: 'Delete Failed',
            message: err.message || 'Could not delete article.',
            type: 'danger'
          });
        }
      }
    });
  };


  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Knowledge Base</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Streets of Tripura institutional memory, policies, SOPs, and event guidelines.
          </p>
        </div>

        {canCreate && !isEditing && (
          <button className="btn btn-primary" onClick={handleStartCreate} title="New Article">
            <Plus size={14} /> <span className="hide-on-mobile-text">New Article</span>
          </button>
        )}
      </div>

      {/* Main split view */}
      {isEditing ? (
        /* Edit/Create Form */
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px' }}>{editingArticle?.id ? 'Edit Knowledge Article' : 'Create Knowledge Article'}</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => { setIsEditing(false); setEditingArticle(null); }}>
              <X size={14} /> Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Article Title</label>
              <input
                type="text"
                required
                className="input"
                value={editingArticle?.title || ''}
                onChange={e => setEditingArticle({ ...editingArticle, title: e.target.value })}
                placeholder="e.g. SOT Photography Curatorial Guidelines"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Category</label>
                <input
                  type="text"
                  className="input"
                  value={editingArticle?.category || ''}
                  onChange={e => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  placeholder="e.g. Branding, Operations, Legal"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Related Project (Optional)</label>
                <select
                  className="select"
                  value={editingArticle?.project_id || ''}
                  onChange={e => setEditingArticle({ ...editingArticle, project_id: e.target.value || null })}
                >
                  <option value="">Global / No Specific Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Content (Markdown Format)
              </label>
              <textarea
                rows={16}
                required
                className="textarea"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                value={editingArticle?.content_markdown || ''}
                onChange={e => setEditingArticle({ ...editingArticle, content_markdown: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><Check size={14} /> Save Article</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="sot-kb-split-container">
          
          {/* Left Column: Index / Search */}
          <div className="sot-kb-index-col">
            {/* Mobile Dropdown Article Selector */}
            <div className="kb-mobile-dropdown-picker" style={{ display: 'none', marginBottom: '12px' }}>
              <select
                className="select"
                value={activeArticle?.id || ''}
                onChange={e => setSearchParams({ id: e.target.value })}
                style={{ fontWeight: 600, fontSize: '13px' }}
              >
                {knowledge.map(article => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Search & List */}
            <div className="kb-desktop-index-list">
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: '32px', fontSize: '12px' }}
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Articles List */}
              <div className="card" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '560px', overflowY: 'auto' }}>
                {filteredArticles.map(article => {
                  const isSelected = activeArticle?.id === article.id;
                  return (
                    <div
                      key={article.id}
                      onClick={() => setSearchParams({ id: article.id })}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--sot-red-subtle)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {article.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span className="badge" style={{ fontSize: '9px' }}>{article.category}</span>
                        {article.project_id && (
                          <span className="badge badge-outline" style={{ fontSize: '9px' }}>
                            {projects.find(p => p.id === article.project_id)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredArticles.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No knowledge articles found.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Document Reader */}
          <div className="card sot-kb-reader-col">
            {activeArticle ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <div className="sot-doc-header">
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, wordBreak: 'break-word' }}>{activeArticle.title}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span className="badge badge-red">{activeArticle.category}</span>
                      {activeArticle.project_id && (
                        <span>Project: <strong style={{ color: 'var(--text-primary)' }}>{projects.find(p => p.id === activeArticle.project_id)?.name}</strong></span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {canEdit && (
                      <button className="btn btn-sm" onClick={() => handleStartEdit(activeArticle)} title="Edit Article">
                        <Edit2 size={13} /> <span className="hide-on-mobile-text">Edit</span>
                      </button>
                    )}
                    {canDelete && (
                      <button className="btn btn-sm" onClick={() => handleDelete(activeArticle.id)} style={{ color: 'var(--accent)' }} title="Delete Article">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Markdown Content */}
                <div className="sot-doc-scroll-body">
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {activeArticle.content_markdown}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                Select an article from the list to read.
              </div>
            )}
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

