import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Button from '../common/Button';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { isAuthenticated, user, university, clearAuth } = useAuthStore();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-text-muted hover:bg-surface-muted hover:text-text'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              CM
            </span>
            <span className="hidden font-semibold text-text sm:inline">
              Campus Marketplace
            </span>
          </Link>
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {isAuthenticated && (
              <>
                <NavLink to="/" className={navLinkClass} end>
                  Home
                </NavLink>
                <NavLink to="/listings" className={navLinkClass}>
                  Browse
                </NavLink>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/chat" className={navLinkClass}>
                  Messages
                </NavLink>
                <NavLink to="/tutoring" className={navLinkClass}>
                  Tutoring
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && university && (
            <span className="hidden text-xs text-text-muted lg:inline">
              {university.name}
            </span>
          )}
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-text sm:inline">
                {user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={clearAuth}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
          {isAuthenticated && <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </Button>}
        </div>
      </div>
      {isMobileMenuOpen && (
        <nav className="border-t border-border bg-surface px-4 py-3 shadow-md md:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1">
            {isAuthenticated && <>
              <MobileLink to="/dashboard" onNavigate={() => setMobileMenuOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/listings" onNavigate={() => setMobileMenuOpen(false)}>Browse</MobileLink>
              <MobileLink to="/chat" onNavigate={() => setMobileMenuOpen(false)}>Messages</MobileLink>
              <MobileLink to="/tutoring" onNavigate={() => setMobileMenuOpen(false)}>Tutoring</MobileLink>
              <MobileLink to="/profile" onNavigate={() => setMobileMenuOpen(false)}>Profile</MobileLink>
            </>}
          </div>
        </nav>
      )}
    </header>
  );
}

function MobileLink({ to, children, onNavigate }: { to: string; children: React.ReactNode; onNavigate: () => void }) {
  return <NavLink to={to} onClick={onNavigate} end={to === '/'} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-text-muted hover:bg-surface-muted'}`}>{children}</NavLink>;
}
