import { apiClient, isMockModeEnabled } from '../../lib/api-client';
import { getAccessToken } from '../../store/authStore';

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

let mockProfile: Profile = {
  id: 'user-student-1', name: 'Demo Student', email: 'student@aau.edu.et',
  universityName: 'Addis Ababa University', department: 'Computer Science', year: 3,
  bio: 'Computer science student interested in building useful campus tools.', avatarUrl: null,
};

export async function fetchProfile(): Promise<Profile> {
  if (isMockModeEnabled()) return { ...mockProfile };
  return apiClient<Profile>('/api/users/me', { token: getAccessToken() });
}

export async function updateProfile(payload: UpdateProfileRequest): Promise<Profile> {
  if (isMockModeEnabled()) {
    mockProfile = { ...mockProfile, ...payload };
    return { ...mockProfile };
  }
  return apiClient<Profile>('/api/users/me', { method: 'PATCH', body: payload, token: getAccessToken() });
}
