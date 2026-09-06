import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { ActionModal, ModalType } from '../components/ActionModal';
import { Layers, Plus, Calendar, FileText, Link2, Image, BookOpen, Check, X, Trash2 } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { projects, knowledge, meetings, documents, links, assets, addProject, deleteProject } = useData();
  const { can, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'knowledge' | 'meetings' | 'documents' | 'links' | 'assets'>('overview');
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0]
  });

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

  const isAdmin = user?.role === 'admin';
  const canCreate = can('CREATE', 'project');

  const handleDeleteProject = (proj: Project) => {
    if (!isAdmin) {
      setActionModal({
        isOpen: true,
        title: 'Admin Access Required',
        message: 'Only system administrators can delete projects.',
        type: 'danger'
      });
      return;
    }

    setActionModal({
      isOpen: true,
      title: 'Delete Project Workspace',
      message: (
        <span>
          Are you sure you want to permanently delete the project <strong>"{proj.name}"</strong>? This will remove all project workspace associations.
        </span>
      ),
      type: 'danger',
      confirmLabel: 'Delete Project',
      onConfirm: async () => {
        try {
          await deleteProject(proj.id);
          if (id === proj.id) {
            navigate('/projects');
          }
          setActionModal({
            isOpen: true,
            title: 'Project Deleted',
            message: `Project "${proj.name}" has been permanently deleted.`,
            type: 'info'
          });
        } catch (err: any) {
          setActionModal({
            isOpen: true,
            title: 'Deletion Failed',
            message: err.message || 'Could not delete project.',
            type: 'danger'
          });
        }
      }
    });
  };

  // Single Project View
  if (id) {
    const project = projects.find(p => p.id === id);
    if (!project) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2>Project not found</h2>
          <Link to="/projects" className="btn btn-sm" style={{ marginTop: '12px' }}>&larr; Back to Projects</Link>
        </div>
      );
    }

    const projectKnowledge = knowledge.filter(k => k.project_id === project.id);
    const projectMeetings = meetings.filter(m => m.project_id === project.id);
    const projectDocs = documents.filter(d => d.project_id === project.id);
    const projectLinks = links.filter(l => l.project_id === project.id);
    const projectAssets = assets.filter(a => a.project_id === project.id);

    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Project Header */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/projects" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>&larr; Projects</Link>
              <span style={{ color: 'var(--border-color)' }}>/</span>
              <span className="badge badge-red">{project.status}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {project.start_date && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Timeline: {project.start_date} {project.end_date ? `— ${project.end_date}` : ''}
                </span>
              )}
              {isAdmin && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleDeleteProject(project)}
                  style={{ color: 'var(--accent)', gap: '4px' }}
                  title="Delete Project (Admins Only)"
                >
                  <Trash2 size={13} /> <span className="hide-on-mobile-text">Delete Project</span>
                </button>
              )}
            </div>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{project.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px', maxWidth: '800px' }}>
            {project.description}
          </p>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', marginTop: '20px', paddingTop: '14px', overflowX: 'auto' }}>
            {[
              { id: 'overview', label: 'Overview', icon: Layers },
              { id: 'knowledge', label: `Knowledge (${projectKnowledge.length})`, icon: BookOpen },
              { id: 'meetings', label: `Meetings (${projectMeetings.length})`, icon: Calendar },
              { id: 'documents', label: `Documents (${projectDocs.length})`, icon: FileText },
              { id: 'links', label: `Links (${projectLinks.length})`, icon: Link2 },
              { id: 'assets', label: `Assets (${projectAssets.length})`, icon: Image },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ gap: '6px' }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>


        {/* Tab Content Panes */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div className="card">
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Recent Project Meetings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {projectMeetings.map(m => (
                  <Link key={m.id} to={`/meetings?id=${m.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 500 }}>{m.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.date}</span>
                  </Link>
                ))}
                {projectMeetings.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No meetings recorded.</div>}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Quick External Links
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {projectLinks.map(l => (
                  <a key={l.id} href={l.url} target="_blank" rel="noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                    <span>{l.title}</span>
                    <span className="badge" style={{ fontSize: '10px' }}>{l.category}</span>
                  </a>
                ))}
                {projectLinks.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No links indexed.</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '14px' }}>Project Knowledge & SOPs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projectKnowledge.map(k => (
                <Link key={k.id} to={`/knowledge?id=${k.id}`} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'block' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{k.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{k.category} • Updated {new Date(k.updated_at).toLocaleDateString()}</div>
                </Link>
              ))}
              {projectKnowledge.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No project-specific articles.</div>}
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '14px' }}>Meeting Minutes for {project.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projectMeetings.map(m => (
                <Link key={m.id} to={`/meetings?id=${m.id}`} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{m.title}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.date}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{m.agenda}</div>
                </Link>
              ))}
              {projectMeetings.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No project meetings recorded.</div>}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '14px' }}>Project Documents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projectDocs.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{d.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.description}</div>
                  </div>
                  <a href={d.file_url} target="_blank" rel="noreferrer" className="btn btn-sm">View File</a>
                </div>
              ))}
              {projectDocs.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No documents uploaded.</div>}
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '14px' }}>External Links & Resources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projectLinks.map(l => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{l.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l.description}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge">{l.category}</span>
                    <a href={l.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">Open Link &rarr;</a>
                  </div>
                </div>
              ))}
              {projectLinks.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No links added for this project.</div>}
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '14px' }}>Visual Assets & Media</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {projectAssets.map(a => (
                <div key={a.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img src={a.thumbnail_url || a.cloudinary_url} alt={a.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                    <span className="badge" style={{ fontSize: '9px', marginTop: '4px' }}>{a.type}</span>
                  </div>
                </div>
              ))}
              {projectAssets.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No visual assets archived.</div>}
            </div>
          </div>
        )}

        {/* Reusable Action / Confirmation Modal for Project View */}
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
  }

  // All Projects Grid View
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;
    addProject({
      name: newProject.name,
      description: newProject.description,
      status: newProject.status as any || 'active',
      start_date: newProject.start_date,
      end_date: newProject.end_date
    });
    const savedName = newProject.name;
    setIsCreating(false);
    setNewProject({ name: '', description: '', status: 'active', start_date: new Date().toISOString().split('T')[0] });

    setActionModal({
      isOpen: true,
      title: 'Project Created',
      message: `Workspace "${savedName}" has been established.`,
      type: 'success'
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Projects & Initiatives</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Workspaces organizing SOT exhibitions, docuseries, campaigns, and annual events.
          </p>
        </div>

        {canCreate && !isCreating && (
          <button className="btn btn-primary" onClick={() => setIsCreating(true)} title="New Project">
            <Plus size={14} /> <span className="hide-on-mobile-text">New Project</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px' }}>Create New Project Workspace</h2>
            <button className="btn-ghost btn-sm" onClick={() => setIsCreating(false)}><X size={14} /></button>
          </div>

          <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Project Name</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. LENS 6.0 / Agartala Photowalk Series"
                value={newProject.name || ''}
                onChange={e => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Description</label>
              <textarea
                rows={3}
                className="textarea"
                placeholder="Brief summary of this initiative..."
                value={newProject.description || ''}
                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Status</label>
                <select
                  className="select"
                  value={newProject.status}
                  onChange={e => setNewProject({ ...newProject, status: e.target.value as any })}
                >
                  <option value="active">Active</option>
                  <option value="planning">Planning</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Start Date</label>
                <input
                  type="date"
                  className="input"
                  value={newProject.start_date || ''}
                  onChange={e => setNewProject({ ...newProject, start_date: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>End Date (Optional)</label>
                <input
                  type="date"
                  className="input"
                  value={newProject.end_date || ''}
                  onChange={e => setNewProject({ ...newProject, end_date: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsCreating(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><Check size={14} /> Create Project</button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
        {projects.map(p => {
          const pKnowledgeCount = knowledge.filter(k => k.project_id === p.id).length;
          const pMeetingsCount = meetings.filter(m => m.project_id === p.id).length;
          const pDocsCount = documents.filter(d => d.project_id === p.id).length;
          const pLinksCount = links.filter(l => l.project_id === p.id).length;

          return (
            <div
              key={p.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color var(--transition-fast)',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-red">{p.status}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {p.start_date && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {p.start_date}
                      </span>
                    )}
                    {isAdmin && (
                      <button
                        className="btn btn-sm btn-ghost"
                        style={{ padding: '2px 6px', color: 'var(--accent)' }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteProject(p);
                        }}
                        title="Delete Project (Admin Only)"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 600 }}>{p.name}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                    {p.description}
                  </p>
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', marginTop: '16px', paddingTop: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>{pKnowledgeCount} Docs</span>
                  <span>{pMeetingsCount} Meets</span>
                  <span>{pDocsCount} Files</span>
                  <span>{pLinksCount} Links</span>
                </div>
                <Link to={`/projects/${p.id}`} className="btn btn-sm btn-ghost" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  View &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reusable Action / Confirmation Modal */}
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

