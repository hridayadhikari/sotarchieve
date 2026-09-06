import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search, FileText, Calendar, Link2, Image, Layers, ArrowRight, X } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { knowledge, meetings, documents, links, assets, projects } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedProjects = q ? projects.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) : [];
  const matchedKnowledge = q ? knowledge.filter(k => k.title.toLowerCase().includes(q) || k.content_markdown.toLowerCase().includes(q) || k.category.toLowerCase().includes(q)) : [];
  const matchedMeetings = q ? meetings.filter(m => m.title.toLowerCase().includes(q) || m.agenda?.toLowerCase().includes(q) || m.decisions?.toLowerCase().includes(q)) : [];
  const matchedDocs = q ? documents.filter(d => d.title.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)) : [];
  const matchedLinks = q ? links.filter(l => l.title.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)) : [];
  const matchedAssets = q ? assets.filter(a => a.name.toLowerCase().includes(q)) : [];

  const totalResults = matchedProjects.length + matchedKnowledge.length + matchedMeetings.length + matchedDocs.length + matchedLinks.length + matchedAssets.length;

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border-color)', gap: '10px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            autoFocus
            placeholder="Search knowledge, meetings, documents, links, projects..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: '0', fontSize: '15px', flex: 1, minWidth: 0 }}
          />
          {query && (
            <button
              className="btn-ghost"
              onClick={() => setQuery('')}
              style={{ cursor: 'pointer', padding: '4px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Clear input"
            >
              <X size={15} />
            </button>
          )}
          <span className="badge badge-outline search-esc-badge" style={{ fontSize: '10px' }}>ESC to close</span>
          <button
            className="btn-ghost search-close-btn"
            onClick={onClose}
            style={{
              padding: '6px',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close search"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px 18px' }}>
          {!query && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Type to search across all SOT archives and resources.
            </div>
          )}

          {query && totalResults === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No results found for "<strong style={{ color: 'var(--text-primary)' }}>{query}</strong>".
            </div>
          )}

          {matchedProjects.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>
                Projects ({matchedProjects.length})
              </div>
              {matchedProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(`/projects/${p.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '4px' }}
                  className="search-item-hover"
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={15} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <span className="badge badge-outline" style={{ fontSize: '10px' }}>{p.status}</span>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          )}

          {matchedKnowledge.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>
                Knowledge Base ({matchedKnowledge.length})
              </div>
              {matchedKnowledge.map(k => (
                <div
                  key={k.id}
                  onClick={() => handleSelect(`/knowledge?id=${k.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={15} style={{ color: 'var(--text-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{k.title}</span>
                    <span className="badge" style={{ fontSize: '10px' }}>{k.category}</span>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          )}

          {matchedMeetings.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>
                Meeting Minutes ({matchedMeetings.length})
              </div>
              {matchedMeetings.map(m => (
                <div
                  key={m.id}
                  onClick={() => handleSelect(`/meetings?id=${m.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={15} style={{ color: 'var(--text-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{m.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.date}</span>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          )}

          {matchedLinks.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>
                Links ({matchedLinks.length})
              </div>
              {matchedLinks.map(l => (
                <div
                  key={l.id}
                  onClick={() => handleSelect(`/links`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link2 size={15} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontWeight: 500 }}>{l.title}</span>
                    <span className="badge" style={{ fontSize: '10px' }}>{l.category}</span>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          )}

          {matchedDocs.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>
                Documents ({matchedDocs.length})
              </div>
              {matchedDocs.map(d => (
                <div
                  key={d.id}
                  onClick={() => handleSelect(`/documents`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={15} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontWeight: 500 }}>{d.title}</span>
                    <span className="badge badge-outline" style={{ fontSize: '10px' }}>{d.category}</span>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          )}

          {matchedAssets.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>
                Assets ({matchedAssets.length})
              </div>
              {matchedAssets.map(a => (
                <div
                  key={a.id}
                  onClick={() => handleSelect(`/assets`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Image size={15} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontWeight: 500 }}>{a.name}</span>
                    <span className="badge badge-outline" style={{ fontSize: '10px' }}>{a.type}</span>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
