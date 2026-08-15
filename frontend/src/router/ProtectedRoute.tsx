import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  allowedRoles,
  requireAdmin = false,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, hasRole, isAdmin } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.some((role) => hasRole(role))) {
    return <Navigate to={isAdmin() ? '/admin' : '/'} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (isAuthenticated) {
    const from =
      (location.state as { from?: { pathname: string } } | null)?.from?.pathname ??
      (isAdmin() ? '/admin' : '/dashboard');
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}

export function AuthLoadingGate({ children }: { children: ReactNode }) {
  const [hasHydrated, setHasHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return unsubscribe;
  }, []);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Loading session" />
      </div>
    );
  }

  return children;
}
