import { apiClient } from '../../lib/api-client';
import { getAccessToken } from '../../store/authStore';

export interface Profile {
  id: string;
  name: string;
  email: string;
  department: string;
  year: number;
  bio: string;
  avatarUrl: string | null;
  universityName: string;
}

export interface UpdateProfileRequest {
  name: string;
  department: string;
  year?: number;
  bio: string;
  avatarUrl?: string | null;
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  department: string | null;
  avatarUrl: string | null;
  bio?: string | null;
  university?: { id: string; name: string };
}

function mapToProfile(user: BackendUser, fallbackUniversityName: string): Profile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department ?? '',
    year: 1,
    bio: user.bio ?? '',
    avatarUrl: user.avatarUrl,
    universityName: user.university?.name ?? fallbackUniversityName,
  };
}

export async function fetchProfile(
  _user: { id: string },
  universityName: string,
): Promise<Profile> {
  const user = await apiClient<BackendUser>('/api/users/me', {
    token: getAccessToken(),
  });
  return mapToProfile(user, universityName);
}

export async function updateProfile(payload: UpdateProfileRequest): Promise<Profile> {
  const { year: _year, ...body } = payload;
  const user = await apiClient<BackendUser>('/api/users/me', {
    method: 'PATCH',
    body,
    token: getAccessToken(),
  });
  return mapToProfile(user, user.university?.name ?? '');
}
