import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ListingsPage from '../pages/ListingsPage';
import ListingDetailPage from '../pages/ListingDetailPage';
import CreateListingPage from '../pages/CreateListingPage';
import EditListingPage from '../pages/EditListingPage';
import MyListingsPage from '../pages/MyListingsPage';
import ProfilePage from '../pages/ProfilePage';
import ChatPage from '../pages/ChatPage';
import TutoringPage from '../pages/TutoringPage';
import AdminPage from '../pages/AdminPage';
import { AuthLoadingGate, GuestRoute, ProtectedRoute } from './ProtectedRoute';

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
            <Route path="/landing" element={<HomePage />} />
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
              <Route path="/dashboard/listings" element={<MyListingsPage />} />
            </Route>
            <Route element={<PublicLayout />}>
              <Route path="/listings" element={<ListingsPage />} />
              <Route path="/listings/new" element={<CreateListingPage />} />
              <Route path="/listings/:id/edit" element={<EditListingPage />} />
              <Route path="/listings/:id" element={<ListingDetailPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:conversationId" element={<ChatPage />} />
              <Route path="/tutoring" element={<TutoringPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requireAdmin />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthLoadingGate>
    </BrowserRouter>
  );
}
