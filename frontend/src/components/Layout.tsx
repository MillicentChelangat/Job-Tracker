import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  {
    to: '/', end: true, label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/>
      </svg>
    ),
  },

{
  to: '/board', end: false, label: 'Board',
  icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="6" y="1" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="11" y="1" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
},

  {
    to: '/jobs', end: false, label: 'Applications',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 8h12" stroke="currentColor" strokeWidth="1.2" opacity=".5"/>
      </svg>
    ),
  },
  
  {
    to: '/documents', end: false, label: 'Documents',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 1.5h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-11a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M9 1.5v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Close the avatar dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app-shell">

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#brandGrad)" />
              <path d="M8 14h12M14 8v12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7C3AED" />
                  <stop offset="1" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          {!collapsed && <span className="brand-name">JobTrack</span>}
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-collapse-toggle">
          <button className="collapse-btn" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main column: top bar + page content ── */}
      <div className="main-column">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="topbar-right">
            <button className="icon-btn" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2a4.5 4.5 0 00-4.5 4.5v2.4c0 .5-.2 1-.55 1.4L3 11.5A1 1 0 003.8 13h10.4a1 1 0 00.8-1.5l-.95-1.2a2 2 0 01-.55-1.4V6.5A4.5 4.5 0 009 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M7.2 15a1.8 1.8 0 003.6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="avatar-menu" ref={menuRef}>
              <button className="avatar-trigger" onClick={() => setMenuOpen((v) => !v)}>
                <div className="user-avatar">{user?.email?.[0]?.toUpperCase() ?? 'U'}</div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                  <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {menuOpen && (
                <div className="avatar-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-email">{user?.email}</p>
                    <p className="dropdown-sub">Job Seeker</p>
                  </div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M2.5 12c.8-2.5 2.5-3.5 4.5-3.5s3.7 1 4.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Profile
                  </Link>
                  <button className="dropdown-item dropdown-danger" onClick={handleLogout}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>

    </div>
  );
}