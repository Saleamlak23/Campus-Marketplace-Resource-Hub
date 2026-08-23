export type UserRole = 'student' | 'university_admin' | 'super_admin';

export interface University {
  id: string;
  name: string;
  allowedEmailDomains: string[];
  createdAt: string;
}

export interface User {
  id: string;
  universityId: string;
  name: string;
  email: string;
  universityIdNumber: string | null;
  department: string | null;
  year: number | null;
  role: UserRole;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  university?: University;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  universityIdNumber?: string;
  department?: string;
  year?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface RegisterResponse {
  email: string;
  message: string;
}

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}

export interface UniversitiesResponse {
  universities: University[];
}

export interface UserProfileResponse {
  user: User;
}
