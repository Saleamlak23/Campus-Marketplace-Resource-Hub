import { Link } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { useMyListingsQuery } from '../features/listings/hooks/useListings';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { user, university } = useAuthStore();
  const { data: myListings, isLoading: isLoadingListings } = useMyListingsQuery(
    user?.id,
  );

  const activeListingsCount = myListings?.listings.filter(
    (l) => l.status === 'available',
  ).length;

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
        <Card>
          <p className="text-sm text-text-muted">Unread messages</p>
          <p className="mt-2 text-3xl font-bold text-text">—</p>
          <p className="mt-1 text-xs text-text-muted">
            Available after Chat UI (Task C)
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Tutoring bookings</p>
          <p className="mt-2 text-3xl font-bold text-text">—</p>
          <p className="mt-1 text-xs text-text-muted">
            Available after Tutoring UI (Task C)
          </p>
        </Card>
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
