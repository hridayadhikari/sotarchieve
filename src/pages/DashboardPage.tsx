import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDisplayName } from '../lib/formatName';
import { Link } from 'react-router-dom';
import {
  Layers,
  BookOpen,
  FileText,
  Calendar,
  Link2,
  Image,
  ArrowUpRight,
  Clock,
  Plus,
  CheckCircle2,
  Circle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { projects, knowledge, meetings, documents, links, assets, profiles, activityLogs, toggleActionItem } = useData();
  const { user } = useAuth();

  const dbProfile = profiles.find(p => p.id === user?.id || (p.email && user?.email && p.email.toLowerCase() === user.email.toLowerCase()));
  const displayName = formatDisplayName(dbProfile?.full_name || dbProfile?.name || user?.full_name || user?.name, user?.email || dbProfile?.email);

  const activeProjects = projects.filter(p => p.status === 'active');
  const recentMeetings = [...meetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  const recentDocs = [...documents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);
  const recentLinks = [...links].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Workspace Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              Streets of Tripura centralized source of truth. Logged in as <strong style={{ color: 'var(--text-primary)' }}>{displayName}</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-outline" style={{ whiteSpace: 'nowrap' }}>
              {projects.length} Projects
            </span>
            <span className="badge badge-outline" style={{ whiteSpace: 'nowrap' }}>
              {knowledge.length} Knowledge Docs
            </span>
            <span className="badge badge-outline" style={{ whiteSpace: 'nowrap' }}>
              {links.length} Resources
            </span>
          </div>
        </div>
      </div>

      {/* Metric summary banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Active Projects</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{activeProjects.length}</div>
        </div>
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Meeting Records</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{meetings.length}</div>
        </div>
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Indexed Resources</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{documents.length + links.length}</div>
        </div>
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Official Assets</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{assets.length}</div>
        </div>
      </div>

      {/* Main Grid: Active Projects & Recent Meetings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Active Projects Widget */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Projects</h2>
            </div>
            <Link to="/projects" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
              View all &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeProjects.map(proj => (
              <Link
                key={proj.id}
                to={`/projects/${proj.id}`}
                style={{
                  display: 'block',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{proj.name}</span>
                  <span className="badge badge-red">{proj.status}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {proj.description}
                </p>
              </Link>
            ))}
            {activeProjects.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '12px 0' }}>No active projects.</div>
            )}
          </div>
        </div>

        {/* Recent Meetings & Action Items */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recent Meetings</h2>
            </div>
            <Link to="/meetings" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
              View all &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentMeetings.map(meet => (
              <div
                key={meet.id}
                style={{
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Link to={`/meetings?id=${meet.id}`} style={{ fontWeight: 600, fontSize: '13px' }}>
                    {meet.title}
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{meet.date}</span>
                    <Link
                      to={`/meetings/${meet.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                      title="Open full standalone page in new tab"
                    >
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
                
                {/* Action Items preview */}
                {meet.action_items.length > 0 && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                      Action Items
                    </div>
                    {meet.action_items.slice(0, 2).map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleActionItem(meet.id, item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: item.completed ? 'line-through' : 'none',
                          marginBottom: '2px'
                        }}
                      >
                        {item.completed ? <CheckCircle2 size={13} style={{ color: 'var(--accent)' }} /> : <Circle size={13} />}
                        <span>{item.text}</span>
                        {item.assignee && <span className="badge" style={{ fontSize: '9px', padding: '0 4px' }}>{item.assignee}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Quick Links & Recent Uploads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Quick Links */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link2 size={16} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Resources & Links</h2>
            </div>
            <Link to="/links" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
              All Links &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentLinks.map(l => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {l.title}
                    <ArrowUpRight size={13} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l.description}</div>
                </div>
                <span className="badge" style={{ fontSize: '10px' }}>{l.category}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Admin-only Activity Log or Member Recent Documents */}
        {user?.role === 'admin' ? (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
                <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Admin Activity Log</h2>
              </div>
              <Link to="/admin" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
                Audit Trail &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activityLogs.slice(0, 5).map(log => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{log.actor?.full_name || log.details?.deleted_by_admin || 'System Admin'}</span>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {log.action.toLowerCase()} {log.target_type}: {log.details?.name || log.details?.title || log.details?.description || ''}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No recent activity.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recent Documents</h2>
              </div>
              <Link to="/documents" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
                All Documents &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentDocs.map(d => (
                <a
                  key={d.id}
                  href={d.file_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{d.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.category}</div>
                  </div>
                  <span className="badge badge-outline" style={{ fontSize: '10px' }}>
                    {d.file_size ? `${(d.file_size / (1024 * 1024)).toFixed(2)} MB` : 'PDF'}
                  </span>
                </a>
              ))}
              {recentDocs.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No documents uploaded yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

