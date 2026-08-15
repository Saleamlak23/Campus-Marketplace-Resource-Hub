import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import { AuthLoadingGate, GuestRoute, ProtectedRoute } from './ProtectedRoute';

function AdminPlaceholderPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Admin Panel</h1>
      <p className="mt-2 text-text-muted">
        Admin moderation tools will be implemented in Trunk Task C.
      </p>
    </div>
  );
}

function PublicLayout() {
  return <MainLayout />;
}

function AuthLayout() {
  return <MainLayout centered />;
}

function DashboardLayout() {
  return <MainLayout showSidebar />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthLoadingGate>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requireAdmin />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminPlaceholderPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthLoadingGate>
    </BrowserRouter>
  );
}
