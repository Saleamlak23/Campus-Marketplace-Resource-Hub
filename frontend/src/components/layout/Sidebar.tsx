import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface SidebarLink {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const links: SidebarLink[] = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/listings', label: 'My Listings' },
  { to: '/dashboard/messages', label: 'Messages' },
  { to: '/admin', label: 'Admin Panel', adminOnly: true },
];

export default function Sidebar() {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return null;
  }

  const visibleLinks = links.filter((link) => !link.adminOnly || isAdmin());

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
      <nav className="flex flex-col gap-1 p-4" aria-label="Dashboard navigation">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-text-muted hover:bg-surface-muted hover:text-text'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
