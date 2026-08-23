import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import type { LoginRequest, RegisterRequest } from '../../../types';
import * as authApi from '../api';

export function useAuth() {
  const navigate = useNavigate();
  const { user, university, isAuthenticated, setAuth, clearAuth, isAdmin, hasRole } =
    useAuthStore();

  const handleLogin = useCallback(
    async (payload: LoginRequest) => {
      const response = await authApi.login(payload);
      setAuth(response);
      if (response.user.role === 'university_admin' || response.user.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    },
    [navigate, setAuth],
  );

  const handleRegister = useCallback(
    async (payload: RegisterRequest) => {
      return authApi.register(payload);
    },
    [],
  );

  const handleVerifyEmail = useCallback(
    async (email: string, code: string) => {
      const response = await authApi.verifyEmail({ email, code });
      setAuth(response);
      navigate('/dashboard');
    },
    [navigate, setAuth],
  );

  const handleResendVerification = useCallback((email: string) => authApi.resendVerification(email), []);

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  return {
    user,
    university,
    isAuthenticated,
    isAdmin: isAdmin(),
    hasRole,
    login: handleLogin,
    register: handleRegister,
    verifyEmail: handleVerifyEmail,
    resendVerification: handleResendVerification,
    logout: handleLogout,
  };
}
