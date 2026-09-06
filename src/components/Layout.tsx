import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { GlobalSearchModal } from './GlobalSearchModal';
import { formatDisplayName } from '../lib/formatName';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  Calendar,
  Link2,
  Image,
  Users,
  ShieldAlert,
  Search,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Menu,
  X
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout, switchMockUser, mockProfiles } = useAuth();
  const { profiles } = useData();
  const { theme, setTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Look up matched profile in loaded database profiles table
  const dbProfile = profiles.find(p => p.id === user?.id || (p.email && user?.email && p.email.toLowerCase() === user.email.toLowerCase()));
  const displayName = formatDisplayName(dbProfile?.full_name || dbProfile?.name || user?.full_name || user?.name, user?.email || dbProfile?.email);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { to: '/projects', label: 'Projects', icon: Layers },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/meetings', label: 'Meeting Minutes', icon: Calendar },
    { to: '/links', label: 'Links', icon: Link2 },
    { to: '/assets', label: 'Assets', icon: Image },
    { to: '/team', label: 'Team', icon: Users },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="sot-layout-root">
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Sidebar Desktop */}
      <aside className="sidebar-desktop">
        <div>
          {/* Header Brand */}
          <div
            style={{
              padding: '20px 18px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    background: 'var(--accent)',
                    borderRadius: '1px',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em' }}>
                  SOT ARCHIVE
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Streets of Tripura
              </div>
            </div>
          </div>

          {/* Quick Search Button */}
          <div style={{ padding: '12px 14px' }}>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '7px 10px',
                color: 'var(--text-muted)',
                fontSize: '12px',
                background: 'var(--bg-secondary)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} /> Search archive...
              </span>
              <kbd style={{ fontSize: '10px', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>Ctrl K</kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                    backgroundColor: isActive ? 'var(--sot-red-subtle)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                  })}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer & User Profile */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '14px' }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className={`badge ${user?.role === 'admin' ? 'badge-red' : ''}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                  {user?.role}
                </span>
                <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</span>
              </div>
            </div>
            <button className="btn-ghost" onClick={handleLogout} title="Logout" style={{ padding: '6px' }}>
              <LogOut size={15} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Theme toggles */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                flex: 1,
                border: 'none',
                background: theme === 'light' ? 'var(--bg-surface)' : 'transparent',
                color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
              }}
              title="Light"
            >
              <Sun size={13} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              style={{
                flex: 1,
                border: 'none',
                background: theme === 'dark' ? 'var(--bg-surface)' : 'transparent',
                color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
              }}
              title="Dark"
            >
              <Moon size={13} />
            </button>
            <button
              onClick={() => setTheme('system')}
              style={{
                flex: 1,
                border: 'none',
                background: theme === 'system' ? 'var(--bg-surface)' : 'transparent',
                color: theme === 'system' ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
              }}
              title="System"
            >
              <Monitor size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="sot-main-wrapper">
        {/* Mobile Header */}
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--accent)' }} />
            <span style={{ fontWeight: 700, fontSize: '14px' }}>SOT ARCHIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-sm" onClick={() => setIsSearchOpen(true)}>
              <Search size={14} />
            </button>
            <button className="btn btn-sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-drawer">
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{displayName}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email} ({user?.role})</div>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={handleLogout} style={{ color: 'var(--accent)' }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      backgroundColor: isActive ? 'var(--sot-red-subtle)' : 'transparent',
                    })}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Theme:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTheme('light')}>Light</button>
                <button className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTheme('dark')}>Dark</button>
                <button className={`btn btn-sm ${theme === 'system' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTheme('system')}>Sys</button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="sot-content-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        .sot-layout-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }
        .sidebar-desktop {
          width: 240px;
          height: 100vh;
          border-right: 1px solid var(--border-color);
          background: var(--bg-surface);
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          flex-shrink: 0;
          overflow-y: auto;
          position: sticky;
          top: 0;
        }
        .sot-main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          min-width: 0;
          overflow: hidden;
        }
        .mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-surface);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .mobile-drawer {
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-color);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .sot-content-main {
          flex: 1;
          padding: 24px 32px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 768px) {
          .sot-layout-root {
            display: block !important;
            height: auto !important;
            min-height: 100vh !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
          }
          .sidebar-desktop {
            display: none !important;
          }
          .sot-main-wrapper {
            height: auto !important;
            min-height: 100vh !important;
            overflow: visible !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .sot-content-main {
            padding: 14px !important;
            height: auto !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
};
