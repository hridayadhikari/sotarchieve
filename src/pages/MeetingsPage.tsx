import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Meeting, ActionItem } from '../types';
import { Calendar, Plus, CheckCircle2, Circle, Edit2, Trash2, X, Check, Paperclip, User } from 'lucide-react';

export const MeetingsPage: React.FC = () => {
  const { meetings, projects, addMeeting, updateMeeting, deleteMeeting, toggleActionItem } = useData();
  const { can } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedId = searchParams.get('id');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  
  const [editingMeeting, setEditingMeeting] = useState<Partial<Meeting> | null>(null);
  const [newActionItemText, setNewActionItemText] = useState('');
  const [newActionItemAssignee, setNewActionItemAssignee] = useState('');

  const filteredMeetings = meetings.filter(m => {
    if (filterProject === 'ALL') return true;
    return m.project_id === filterProject;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeMeeting = meetings.find(m => m.id === selectedId) || (filteredMeetings.length > 0 ? filteredMeetings[0] : null);

  const canCreate = can('CREATE', 'meetings');
  const canEdit = activeMeeting ? can('EDIT', 'meetings', activeMeeting.project_id) : false;
  const canDelete = activeMeeting ? can('DELETE', 'meetings', activeMeeting.project_id) : false;

  const handleStartCreate = () => {
    setEditingMeeting({
      title: '',
      date: new Date().toISOString().split('T')[0],
      project_id: null,
      attendees: [],
      agenda: '',
      discussion: '',
      decisions: '',
      action_items: [],
      attachments: []
    });
    setIsEditing(true);
  };

  const handleStartEdit = (m: Meeting) => {
    setEditingMeeting({ ...m });
    setIsEditing(true);
  };

  const handleAddActionItem = () => {
    if (!newActionItemText.trim() || !editingMeeting) return;
    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      text: newActionItemText.trim(),
      completed: false,
      assignee: newActionItemAssignee.trim() || undefined
    };
    setEditingMeeting({
      ...editingMeeting,
      action_items: [...(editingMeeting.action_items || []), newItem]
    });
    setNewActionItemText('');
    setNewActionItemAssignee('');
  };

  const handleRemoveActionItem = (itemId: string) => {
    if (!editingMeeting) return;
    setEditingMeeting({
      ...editingMeeting,
      action_items: editingMeeting.action_items?.filter(a => a.id !== itemId) || []
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting?.title || !editingMeeting.date) return;

    if (editingMeeting.id) {
      updateMeeting(editingMeeting.id, editingMeeting);
    } else {
      addMeeting({
        title: editingMeeting.title,
        date: editingMeeting.date,
        project_id: editingMeeting.project_id || null,
        attendees: typeof editingMeeting.attendees === 'string' 
          ? (editingMeeting.attendees as string).split(',').map((s: string) => s.trim()) 
          : editingMeeting.attendees || [],
        agenda: editingMeeting.agenda || '',
        discussion: editingMeeting.discussion || '',
        decisions: editingMeeting.decisions || '',
        action_items: editingMeeting.action_items || [],
        attachments: editingMeeting.attachments || []
      });
    }
    setIsEditing(false);
    setEditingMeeting(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete these meeting minutes permanently?')) {
      deleteMeeting(id);
      if (selectedId === id) setSearchParams({});
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Meeting Minutes</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Permanent record of SOT team syncs, agendas, decisions, and actionable task checklists.
          </p>
        </div>

        {canCreate && !isEditing && (
          <button className="btn btn-primary" onClick={handleStartCreate} title="Record Meeting">
            <Plus size={14} /> <span className="hide-on-mobile-text">Record Meeting</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px' }}>{editingMeeting?.id ? 'Edit Meeting Record' : 'Record New Meeting'}</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
              <X size={14} /> Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Meeting Title</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. LENS 5.0 Curation & Printing Review"
                  value={editingMeeting?.title || ''}
                  onChange={e => setEditingMeeting({ ...editingMeeting, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Meeting Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={editingMeeting?.date || ''}
                  onChange={e => setEditingMeeting({ ...editingMeeting, date: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Project Association</label>
                <select
                  className="select"
                  value={editingMeeting?.project_id || ''}
                  onChange={e => setEditingMeeting({ ...editingMeeting, project_id: e.target.value || null })}
                >
                  <option value="">General SOT Meeting</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Attendees (Comma separated)
              </label>
              <input
                type="text"
                className="input"
                placeholder="Hriday, Rahul Debbarma, Aditi Roy, Sayan Paul"
                value={Array.isArray(editingMeeting?.attendees) ? editingMeeting.attendees.join(', ') : editingMeeting?.attendees || ''}
                onChange={e => setEditingMeeting({ ...editingMeeting, attendees: e.target.value as any })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Agenda</label>
              <textarea
                rows={3}
                className="textarea"
                placeholder="Key discussion points scheduled for this session..."
                value={editingMeeting?.agenda || ''}
                onChange={e => setEditingMeeting({ ...editingMeeting, agenda: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Discussion Notes</label>
              <textarea
                rows={4}
                className="textarea"
                placeholder="Detailed flow of points debated and reviewed..."
                value={editingMeeting?.discussion || ''}
                onChange={e => setEditingMeeting({ ...editingMeeting, discussion: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Decisions Made</label>
              <textarea
                rows={3}
                className="textarea"
                placeholder="Final consensus items, budget approvals, and timeline decisions..."
                value={editingMeeting?.decisions || ''}
                onChange={e => setEditingMeeting({ ...editingMeeting, decisions: e.target.value })}
              />
            </div>

            {/* Action Items Sub-Form */}
            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                Action Items / Next Steps
              </label>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="input"
                  style={{ flex: 2 }}
                  placeholder="Task description (e.g. Finalize sponsorship agreement)"
                  value={newActionItemText}
                  onChange={e => setNewActionItemText(e.target.value)}
                />
                <input
                  type="text"
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="Assignee (e.g. Rahul)"
                  value={newActionItemAssignee}
                  onChange={e => setNewActionItemAssignee(e.target.value)}
                />
                <button type="button" className="btn btn-sm btn-primary" onClick={handleAddActionItem}>
                  Add Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {editingMeeting?.action_items?.map(act => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '13px' }}>
                      {act.text} {act.assignee && <strong style={{ color: 'var(--accent)' }}>({act.assignee})</strong>}
                    </span>
                    <button type="button" className="btn-ghost" onClick={() => handleRemoveActionItem(act.id)} style={{ padding: '2px 6px' }}>
                      <Trash2 size={13} style={{ color: 'var(--accent)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><Check size={14} /> Save Minutes</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="sot-kb-split-container">
          
          {/* Left Column: Meeting Index */}
          <div className="sot-kb-index-col">
            {/* Mobile Dropdown Meeting Selector */}
            <div className="kb-mobile-dropdown-picker" style={{ display: 'none', marginBottom: '12px' }}>
              <select
                className="select"
                value={activeMeeting?.id || ''}
                onChange={e => setSearchParams({ id: e.target.value })}
                style={{ fontWeight: 600, fontSize: '13px' }}
              >
                {filteredMeetings.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.date} — {m.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Index & Project Filter */}
            <div className="kb-desktop-index-list">
              <select className="select" style={{ marginBottom: '10px' }} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
                <option value="ALL">All Projects / SOT Wide</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <div className="card" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '560px', overflowY: 'auto' }}>
                {filteredMeetings.map(m => {
                  const isSelected = activeMeeting?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSearchParams({ id: m.id })}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--sot-red-subtle)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {m.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>{m.date}</span>
                        <span className="badge" style={{ fontSize: '9px' }}>
                          {m.action_items.filter(a => a.completed).length}/{m.action_items.length} tasks
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredMeetings.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No meeting minutes recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Archival Meeting Document */}
          <div className="card sot-kb-reader-col">
            {activeMeeting ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Sticky Header */}
                <div className="sot-doc-header">
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, wordBreak: 'break-word' }}>{activeMeeting.title}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span className="badge badge-red">{activeMeeting.date}</span>
                      {activeMeeting.project_id && (
                        <span>Project: <strong style={{ color: 'var(--text-primary)' }}>{projects.find(p => p.id === activeMeeting.project_id)?.name}</strong></span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {canEdit && (
                      <button className="btn btn-sm" onClick={() => handleStartEdit(activeMeeting)} title="Edit Meeting">
                        <Edit2 size={13} /> <span className="hide-on-mobile-text">Edit</span>
                      </button>
                    )}
                    {canDelete && (
                      <button className="btn btn-sm" onClick={() => handleDelete(activeMeeting.id)} style={{ color: 'var(--accent)' }} title="Delete Record">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Meeting Body Scroll Viewport */}
                <div className="sot-doc-scroll-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Attendees */}
                  {activeMeeting.attendees && activeMeeting.attendees.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '8px' }}>
                        Attendees
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {activeMeeting.attendees.map((person, idx) => (
                          <span key={idx} className="badge badge-outline" style={{ fontSize: '11px', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} /> {person}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agenda */}
                  {activeMeeting.agenda && (
                    <div>
                      <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        Agenda
                      </h3>
                      <p style={{ whiteSpace: 'pre-line', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                        {activeMeeting.agenda}
                      </p>
                    </div>
                  )}

                  {/* Discussion */}
                  {activeMeeting.discussion && (
                    <div>
                      <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        Discussion & Review
                      </h3>
                      <p style={{ whiteSpace: 'pre-line', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                        {activeMeeting.discussion}
                      </p>
                    </div>
                  )}

                  {/* Decisions */}
                  {activeMeeting.decisions && (
                    <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent)' }}>
                      <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        Key Decisions
                      </h3>
                      <p style={{ whiteSpace: 'pre-line', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                        {activeMeeting.decisions}
                      </p>
                    </div>
                  )}

                  {/* Interactive Action Items */}
                  <div>
                    <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '10px' }}>
                      Action Items ({activeMeeting.action_items.filter(a => a.completed).length}/{activeMeeting.action_items.length} Completed)
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeMeeting.action_items.map(item => (
                        <div
                          key={item.id}
                          onClick={() => toggleActionItem(activeMeeting.id, item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'background var(--transition-fast)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.completed ? (
                              <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
                            ) : (
                              <Circle size={16} style={{ color: 'var(--border-color)' }} />
                            )}
                            <span style={{ fontSize: '13px', textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                              {item.text}
                            </span>
                          </div>
                          {item.assignee && (
                            <span className="badge badge-red" style={{ fontSize: '10px' }}>
                              {item.assignee}
                            </span>
                          )}
                        </div>
                      ))}

                      {activeMeeting.action_items.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No action items recorded for this meeting.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                Select a meeting record to view details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
