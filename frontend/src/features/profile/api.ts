import { apiClient, isMockModeEnabled } from '../../lib/api-client';
import { getAccessToken } from '../../store/authStore';
import type { User } from '../../types';

export interface Profile {
  id: string;
  name: string;
  email: string;
  universityName: string;
  department: string;
  year: number;
  bio: string;
  avatarUrl: string | null;
}

export type UpdateProfileRequest = Pick<Profile, 'name' | 'department' | 'year' | 'bio' | 'avatarUrl'>;

export function profileFromUser(user: User, universityName: string): Profile {
  return { id: user.id, name: user.name, email: user.email, universityName,
    department: user.department ?? '', year: user.year ?? 1, bio: user.bio ?? '', avatarUrl: user.avatarUrl };
}

export async function fetchProfile(user: User, universityName: string): Promise<Profile> {
  if (isMockModeEnabled()) return profileFromUser(user, universityName);
  return apiClient<Profile>('/api/users/me', { token: getAccessToken() });
}

export async function updateProfile(payload: UpdateProfileRequest): Promise<Profile> {
  if (isMockModeEnabled()) {
    const user = JSON.parse(localStorage.getItem('campus-marketplace-auth') ?? '{}')?.state?.user as User | undefined;
    if (!user) throw new Error('No active user.');
    return { ...profileFromUser(user, user.university?.name ?? 'Addis Ababa University'), ...payload };
  }
  return apiClient<Profile>('/api/users/me', { method: 'PATCH', body: payload, token: getAccessToken() });
}
