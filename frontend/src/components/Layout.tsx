import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';


export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
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
          <span className="brand-name">JobTrack</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/>
              </svg>
            </span>
            Dashboard
          </NavLink>

          <NavLink to="/jobs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 8h12" stroke="currentColor" strokeWidth="1.2" opacity=".5"/>
              </svg>
            </span>
            Applications
          </NavLink>

          <NavLink to="/jobs/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            Add Job
          </NavLink>
           <NavLink to="/documents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 1.5h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-11a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 1.5v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </span>
        Documents
      </NavLink>
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className="user-info" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="user-avatar">{user?.email?.[0]?.toUpperCase() ?? 'U'}</div>
            <div className="user-details">
              <p className="user-name">{user?.email}</p>
              <p className="user-email">Job Seeker</p>
            </div>
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

     

      {/* ── Main Content ── */}
      <main className="main-content">
        {children}
      </main>

    </div>
  );
}