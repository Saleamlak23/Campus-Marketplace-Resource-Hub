import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Button from '../common/Button';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore();
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
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/listings" className={navLinkClass}>
                  Browse
                </NavLink>
                <NavLink to="/tutoring" className={navLinkClass}>
                  Tutoring
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                aria-label="Open your profile"
                title="Profile"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                    {user?.name?.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </Link>
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
              <MobileLink to="/tutoring" onNavigate={() => setMobileMenuOpen(false)}>Tutoring</MobileLink>
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
