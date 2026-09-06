import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Users, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { profiles, permissions } = useData();
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Streets of Tripura Team</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Internal roster of SOT members, coordinators, and administrators (15–20 core team).
          </p>
        </div>

        <span className="badge badge-outline">{profiles.length} Members</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {profiles.map(member => {
          const memberPerms = permissions.filter(p => p.user_id === member.id);

          return (
            <div key={member.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        background: member.role === 'admin' ? 'var(--accent)' : 'var(--bg-secondary)',
                        color: member.role === 'admin' ? '#FFFFFF' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px'
                      }}
                    >
                      {member.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{member.full_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={11} /> {member.email}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${member.role === 'admin' ? 'badge-red' : ''}`}>
                    {member.role}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '6px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                    Permission Profile
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {member.role === 'admin' ? (
                      <span className="badge badge-red" style={{ fontSize: '10px' }}>
                        <Shield size={10} /> Full Administrative Access
                      </span>
                    ) : memberPerms.length > 0 ? (
                      memberPerms.map(p => (
                        <span key={p.id} className="badge badge-outline" style={{ fontSize: '10px' }}>
                          {p.resource_type}: {p.permission}
                        </span>
                      ))
                    ) : (
                      <span className="badge badge-outline" style={{ fontSize: '10px' }}>
                        Default VIEW Only
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', marginTop: '14px', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Status:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: member.is_active ? 'var(--text-primary)' : 'var(--accent)' }}>
                  {member.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {member.is_active ? 'Active Member' : 'Disabled'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
