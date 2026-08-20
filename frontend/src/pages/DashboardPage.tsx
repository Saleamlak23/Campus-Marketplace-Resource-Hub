import { Link } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { useMyListingsQuery } from '../features/listings/hooks/useListings';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { fetchConversations } from '../features/chat/api';
import { fetchBookings } from '../features/tutoring/api';

export default function DashboardPage() {
  const { user, university } = useAuthStore();
  const { data: myListings, isLoading: isLoadingListings } = useMyListingsQuery(
    user?.id,
  );

  const activeListingsCount = myListings?.listings.filter(
    (l) => l.status === 'AVAILABLE',
  ).length;
  const { data: conversations = [] } = useQuery({ queryKey: ['conversations'], queryFn: fetchConversations });
  const { data: bookings = [] } = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });
  const activeChatsCount = conversations.length;
  const upcomingBookingsCount = bookings.filter((booking) => booking.status !== 'DECLINED' && new Date(booking.scheduledAt) >= new Date()).length;

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="primary" className="mb-3">
          Student dashboard
        </Badge>
        <h1 className="text-2xl font-bold text-text">
          Welcome back, {user?.name ?? 'Student'}
        </h1>
        <p className="mt-2 text-text-muted">
          Your hub for listings, tutoring, and messages at{' '}
          {university?.name ?? 'your university'}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/dashboard/listings">
          <Card hoverable>
            <p className="text-sm text-text-muted">Active listings</p>
            <p className="mt-2 text-3xl font-bold text-text">
              {isLoadingListings ? '—' : (activeListingsCount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              View and manage your listings
            </p>
          </Card>
        </Link>
        <Link to="/chat">
        <Card hoverable>
          <p className="text-sm text-text-muted">Active chats</p>
          <p className="mt-2 text-3xl font-bold text-text">{activeChatsCount}</p>
          <p className="mt-1 text-xs text-text-muted">
            Open your active conversations
          </p>
        </Card>
        </Link>
        <Link to="/tutoring">
        <Card hoverable>
          <p className="text-sm text-text-muted">Tutoring bookings</p>
          <p className="mt-2 text-3xl font-bold text-text">{upcomingBookingsCount}</p>
          <p className="mt-1 text-xs text-text-muted">
            View upcoming tutoring sessions
          </p>
        </Card>
        </Link>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-text">Account details</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Email</dt>
            <dd className="font-medium text-text">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Department</dt>
            <dd className="font-medium text-text">{user?.department ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-text-muted">University ID</dt>
            <dd className="font-medium text-text">
              {user?.universityIdNumber ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Role</dt>
            <dd className="font-medium capitalize text-text">
              {user?.role.replace('_', ' ')}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
