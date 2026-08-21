import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Button from '../common/Button';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { isAuthenticated, user, isAdmin, clearAuth } = useAuthStore();
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
            className="flex min-w-0 items-center gap-0 md:gap-1"
            aria-label="Main navigation"
          >
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `${navLinkClass({ isActive })} px-1 text-xs md:px-3 md:text-sm`}>
                  Dashboard
                </NavLink>
                <NavLink to="/listings" className={({ isActive }) => `${navLinkClass({ isActive })} px-1 text-xs md:px-3 md:text-sm`}>
                  Browse
                </NavLink>
                <NavLink to="/tutoring" className={({ isActive }) => `${navLinkClass({ isActive })} px-1 text-xs md:px-3 md:text-sm`}>
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
              <MobileLink to="/dashboard" onNavigate={() => setMobileMenuOpen(false)}>Overview</MobileLink>
              <MobileLink to="/dashboard/listings" onNavigate={() => setMobileMenuOpen(false)}>My Listings</MobileLink>
              <MobileLink to="/profile" onNavigate={() => setMobileMenuOpen(false)}>My Profile</MobileLink>
              <MobileLink to="/chat" onNavigate={() => setMobileMenuOpen(false)}>Messages</MobileLink>
              {isAdmin() && <MobileLink to="/admin" onNavigate={() => setMobileMenuOpen(false)}>Admin Panel</MobileLink>}
              <Button variant="outline" className="mt-2 w-full" onClick={clearAuth}>
                Log out
              </Button>
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
