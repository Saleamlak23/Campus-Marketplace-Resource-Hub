import { apiClient } from '../../lib/api-client';
import { getAccessToken } from '../../store/authStore';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  RefreshRequest,
  UniversitiesResponse,
  UserProfileResponse,
  VerifyEmailRequest,
} from '../../types';
import type { University, User } from '../../types';

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function refreshToken(payload: RefreshRequest): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function verifyEmail(payload: VerifyEmailRequest): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/auth/verify-email', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function resendVerification(email: string): Promise<{ email: string; message: string }> {
  return apiClient<{ email: string; message: string }>('/api/auth/resend-verification', {
    method: 'POST',
    body: { email },
    skipAuth: true,
  });
}

export async function fetchUniversities(): Promise<UniversitiesResponse> {
  const data = await apiClient<UniversitiesResponse | University[]>('/api/universities', {
    method: 'GET',
    skipAuth: true,
  });
  if (Array.isArray(data)) {
    return { universities: data };
  }
  return data;
}

export async function fetchCurrentUser(): Promise<UserProfileResponse> {
  const user = await apiClient<User>('/api/users/me', {
    method: 'GET',
    token: getAccessToken(),
  });
  return { user };
}
