import { apiClient } from '../../lib/api-client';
import { getAccessToken } from '../../store/authStore';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  department: string | null;
  role: string;
  isBanned: boolean;
  createdAt: string;
  university?: { id: string; name: string };
}

export interface AdminReport {
  id: string;
  universityId: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reporter?: { id: string; name: string; email: string };
}

export interface PaginatedUsers {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginatedReports {
  reports: AdminReport[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchAdminUsers(page = 1, pageSize = 20): Promise<PaginatedUsers> {
  const data = await apiClient<PaginatedUsers | AdminUser[]>(
    `/api/admin/users?page=${page}&pageSize=${pageSize}`,
    { token: getAccessToken() },
  );
  if (Array.isArray(data)) {
    return { users: data, total: data.length, page: 1, pageSize: data.length };
  }
  return data;
}

export async function banUser(userId: string, banReason?: string): Promise<AdminUser> {
  return apiClient<AdminUser>(`/api/admin/users/${userId}/ban`, {
    method: 'PATCH',
    body: banReason ? { banReason } : {},
    token: getAccessToken(),
  });
}

export async function unbanUser(userId: string): Promise<AdminUser> {
  return apiClient<AdminUser>(`/api/admin/users/${userId}/unban`, {
    method: 'PATCH',
    token: getAccessToken(),
  });
}

export async function deleteAdminListing(listingId: string): Promise<void> {
  return apiClient<void>(`/api/admin/listings/${listingId}`, {
    method: 'DELETE',
    token: getAccessToken(),
  });
}

export async function fetchAdminReports(
  status?: ReportStatus,
  page = 1,
  pageSize = 20
): Promise<PaginatedReports> {
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) qs.set('status', status);
  return apiClient<PaginatedReports>(`/api/admin/reports?${qs.toString()}`, {
    token: getAccessToken(),
  });
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus
): Promise<AdminReport> {
  return apiClient<AdminReport>(`/api/admin/reports/${reportId}`, {
    method: 'PATCH',
    body: { status },
    token: getAccessToken(),
  });
}
