import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PermissionType, ResourceType } from '../types';
import { ShieldAlert, UserPlus, Key, UserCheck, UserX, Trash2, Check, X, Shield, Clock } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { profiles, permissions, projects, grantPermission, revokePermission, toggleMemberActive, createMember, activityLogs } = useData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'members' | 'permissions' | 'activity'>('permissions');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(profiles[1]?.id || profiles[0]?.id);

  // New Member Modal Form
  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'member' | 'admin'>('member');
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

  // New Permission assignment
  const [permType, setPermType] = useState<PermissionType>('EDIT');
  const [resType, setResType] = useState<ResourceType>('documents');
  const [resId, setResId] = useState<string>('');

  if (user?.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <ShieldAlert size={40} style={{ color: 'var(--accent)', margin: '0 auto 12px' }} />
        <h2>Restricted Area</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
          Administrator privileges are required to view this panel.
        </p>
      </div>
    );
  }

  const selectedMember = profiles.find(p => p.id === selectedMemberId);
  const selectedMemberPerms = permissions.filter(p => p.user_id === selectedMemberId);

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    grantPermission(selectedMemberId, permType, resType, resId || null);
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail) return;
    try {
      await createMember(newFullName, newEmail, newRole, newPassword || 'password123');
      setCreateSuccessMsg(`Member "${newFullName}" created successfully! They can log in with their email and password.`);
      setIsCreatingMember(false);
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      setTimeout(() => setCreateSuccessMsg(null), 6000);
    } catch (err: any) {
      alert(`Error creating member: ${err.message || err}`);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} style={{ color: 'var(--accent)' }} />
              <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Admin & Permissions Control</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
              Manage team accounts, grant granular global/project overrides, and monitor system activity logs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`btn btn-sm ${activeTab === 'permissions' ? 'btn-primary' : 'btn-ghost'}`}
              title="Permissions Matrix"
            >
              <Key size={14} /> <span className="hide-on-mobile-text">Permissions Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`btn btn-sm ${activeTab === 'members' ? 'btn-primary' : 'btn-ghost'}`}
              title="Team Accounts"
            >
              <UserCheck size={14} /> <span className="hide-on-mobile-text">Team Accounts</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`btn btn-sm ${activeTab === 'activity' ? 'btn-primary' : 'btn-ghost'}`}
              title="Audit Trail"
            >
              <Clock size={14} /> <span className="hide-on-mobile-text">Audit Trail</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab: Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="sot-admin-matrix-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Member Picker */}
          <div className="card" style={{ padding: '12px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>
              Select Team Member
            </div>

            {/* Mobile Dropdown for Member selection */}
            <div className="admin-mobile-member-select" style={{ display: 'none', marginBottom: '8px' }}>
              <select
                className="select"
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                style={{ fontWeight: 600, fontSize: '13px' }}
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop list for Member selection */}
            <div className="admin-desktop-member-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {profiles.map(p => {
                const isSelected = p.id === selectedMemberId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedMemberId(p.id)}
                    className="btn btn-sm"
                    style={{
                      justifyContent: 'space-between',
                      background: isSelected ? 'var(--sot-red-subtle)' : 'transparent',
                      borderColor: isSelected ? 'var(--accent)' : 'transparent',
                      color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                      textAlign: 'left',
                      padding: '8px 10px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.role}</div>
                    </div>
                    {p.role === 'admin' && <Shield size={13} style={{ color: 'var(--accent)' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Permission Configurator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '16px' }}>Managing: {selectedMember?.full_name}</h2>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedMember?.email} • Role: {selectedMember?.role}</span>
                </div>
                <span className="badge badge-outline">
                  Default: All Members have VIEW permission
                </span>
              </div>

              {selectedMember?.role === 'admin' ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  This user is an <strong>Administrator</strong> and automatically holds unrestricted permissions across all global and project resources.
                </div>
              ) : (
                <div>
                  {/* Current assigned permissions */}
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Explicitly Granted Permissions ({selectedMemberPerms.length})
                    </h3>

                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Resource</th>
                            <th>Scope / Project</th>
                            <th>Granted Permission</th>
                            <th style={{ textAlign: 'right' }}>Revoke</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMemberPerms.map(perm => (
                            <tr key={perm.id}>
                              <td><span className="badge">{perm.resource_type}</span></td>
                              <td>
                                {perm.resource_id 
                                  ? (projects.find(p => p.id === perm.resource_id)?.name || perm.resource_id)
                                  : 'Global Wildcard'}
                              </td>
                              <td><span className="badge badge-red">{perm.permission}</span></td>
                              <td style={{ textAlign: 'right' }}>
                                <button className="btn btn-sm btn-ghost" onClick={() => revokePermission(perm.id)}>
                                  <Trash2 size={13} style={{ color: 'var(--accent)' }} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {selectedMemberPerms.length === 0 && (
                            <tr>
                              <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                No elevated permissions granted. Member has standard <strong>VIEW ONLY</strong> access.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Grant New Permission Form */}
                  <form onSubmit={handleGrant} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '10px' }}>
                      Grant Granular Permission
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>Resource</label>
                        <select className="select" value={resType} onChange={e => setResType(e.target.value as any)}>
                          <option value="documents">Documents</option>
                          <option value="meetings">Meeting Minutes</option>
                          <option value="knowledge">Knowledge Base</option>
                          <option value="links">Links</option>
                          <option value="assets">Official Assets</option>
                          <option value="project">Projects</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>Scope</label>
                        <select className="select" value={resId} onChange={e => setResId(e.target.value)}>
                          <option value="">Global / All</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>Project: {p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>Permission Level</label>
                        <select className="select" value={permType} onChange={e => setPermType(e.target.value as any)}>
                          <option value="CREATE">CREATE</option>
                          <option value="EDIT">EDIT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="MANAGE">MANAGE</option>
                        </select>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
                        Grant Access
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Member Management */}
      {activeTab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {createSuccessMsg && (
            <div style={{ padding: '10px 14px', background: 'var(--sot-red-subtle)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', color: 'var(--accent)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} /> {createSuccessMsg}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px' }}>Team Member Accounts</h2>
            <button className="btn btn-primary" onClick={() => setIsCreatingMember(true)} title="Add Team Member">
              <UserPlus size={14} /> <span className="hide-on-mobile-text">Add Team Member</span>
            </button>
          </div>

          {isCreatingMember && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px' }}>Create SOT Internal Account</h3>
                <button className="btn-ghost btn-sm" onClick={() => setIsCreatingMember(false)}><X size={14} /></button>
              </div>

              <form onSubmit={handleCreateMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="e.g. Sayan Paul"
                      value={newFullName}
                      onChange={e => setNewFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>Email Address</label>
                    <input
                      type="email"
                      required
                      className="input"
                      placeholder="sayan@streetsoftripura.in"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>Temporary Password (default: password123)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter temporary password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>Role</label>
                    <select className="select" value={newRole} onChange={e => setNewRole(e.target.value as any)}>
                      <option value="member">Member (View default + custom permissions)</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsCreatingMember(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary"><Check size={14} /> Create Member Account</button>
                </div>
              </form>
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.full_name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.email}</td>
                    <td><span className={`badge ${p.role === 'admin' ? 'badge-red' : ''}`}>{p.role}</span></td>
                    <td>
                      <span className="badge badge-outline">
                        {p.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {p.id !== user?.id && (
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => toggleMemberActive(p.id)}
                          style={{ color: p.is_active ? 'var(--accent)' : 'var(--text-primary)' }}
                        >
                          {p.is_active ? 'Disable' : 'Restore'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Activity Audit Trail */}
      {activeTab === 'activity' && (
        <div className="card">
          <h2 style={{ fontSize: '16px', marginBottom: '14px' }}>System Activity Log & Audit Trail</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td><strong>{log.actor?.full_name || 'System'}</strong></td>
                    <td><span className="badge badge-red">{log.action}</span></td>
                    <td>{log.target_type}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {log.details ? JSON.stringify(log.details) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
