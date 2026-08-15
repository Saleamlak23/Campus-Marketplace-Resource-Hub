import { apiClient } from '../../lib/api-client';
import { getAccessToken } from '../../store/authStore';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshRequest,
  UniversitiesResponse,
  UserProfileResponse,
  VerifyEmailRequest,
} from '../../types';

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/auth/register', {
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

export async function verifyEmail(payload: VerifyEmailRequest): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/api/auth/verify-email', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function fetchUniversities(): Promise<UniversitiesResponse> {
  return apiClient<UniversitiesResponse>('/api/universities', {
    method: 'GET',
    skipAuth: true,
  });
}

export async function fetchCurrentUser(): Promise<UserProfileResponse> {
  return apiClient<UserProfileResponse>('/api/users/me', {
    method: 'GET',
    token: getAccessToken(),
  });
}
