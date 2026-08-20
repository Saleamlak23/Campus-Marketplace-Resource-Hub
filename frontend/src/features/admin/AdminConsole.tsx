import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import {
  banUser,
  deleteAdminListing,
  fetchAdminReports,
  fetchAdminUsers,
  unbanUser,
  updateReportStatus,
  type AdminReport,
  type AdminUser,
} from './api';

export default function AdminConsole() {
  const [tab, setTab] = useState<'reports' | 'users' | 'stats'>('reports');
  const qc = useQueryClient();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetchAdminUsers(),
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => fetchAdminReports('PENDING'),
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-users'] });
    qc.invalidateQueries({ queryKey: ['admin-reports'] });
  };

  const removeListing = useMutation({
    mutationFn: deleteAdminListing,
    onSuccess: refresh,
  });

  const ban = useMutation({
    mutationFn: (userId: string) => banUser(userId),
    onSuccess: refresh,
  });

  const unban = useMutation({
    mutationFn: (userId: string) => unbanUser(userId),
    onSuccess: refresh,
  });

  const dismissReport = useMutation({
    mutationFn: (reportId: string) => updateReportStatus(reportId, 'DISMISSED'),
    onSuccess: refresh,
  });

  const isLoading = usersLoading || reportsLoading;
  const users = usersData?.users ?? [];
  const reports = reportsData?.reports ?? [];

  if (isLoading) return <Card>Loading moderation tools…</Card>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin panel</h1>
        <p className="text-text-muted">Moderation workspace for your university.</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <Tab active={tab === 'reports'} onClick={() => setTab('reports')}>
          Pending reports
        </Tab>
        <Tab active={tab === 'users'} onClick={() => setTab('users')}>
          Users
        </Tab>
        <Tab active={tab === 'stats'} onClick={() => setTab('stats')}>
          Stats
        </Tab>
      </div>

      {tab === 'reports' && (
        <Card padding="none">
          <div className="divide-y divide-border">
            {reports.map((report: AdminReport) => (
              <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {report.targetType} · {report.targetId.slice(0, 8)}…
                  </p>
                  <p className="text-sm text-text-muted">
                    Reported by {report.reporter?.name ?? report.reporterId}: {report.reason}
                  </p>
                </div>
                <div className="flex gap-2">
                  {report.targetType === 'LISTING' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => removeListing.mutate(report.targetId)}
                    >
                      Delete listing
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => dismissReport.mutate(report.id)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
            {reports.length === 0 && <p className="p-5 text-text-muted">No pending reports.</p>}
          </div>
        </Card>
      )}

      {tab === 'users' && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-text-muted">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: AdminUser) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="p-4">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-text-muted">{user.email}</p>
                    </td>
                    <td className="p-4">{user.department ?? '—'}</td>
                    <td className="p-4">
                      <Badge variant={user.isBanned ? 'danger' : 'success'}>
                        {user.isBanned ? 'Suspended' : 'Active'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant={user.isBanned ? 'outline' : 'danger'}
                        onClick={() =>
                          user.isBanned ? unban.mutate(user.id) : ban.mutate(user.id)
                        }
                      >
                        {user.isBanned ? 'Restore user' : 'Ban / Suspend'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'stats' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Total users" value={String(users.length)} />
          <Metric label="Pending reports" value={String(reports.length)} />
          <Metric label="Active users" value={String(users.filter((u) => !u.isBanned).length)} />
        </div>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-2 text-sm font-medium ${
        active ? 'border-primary-600 text-primary-700' : 'border-transparent text-text-muted'
      }`}
    >
      {children}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </Card>
  );
}
