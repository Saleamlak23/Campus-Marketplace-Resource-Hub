import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, University, User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  university: University | null;
  isAuthenticated: boolean;
  setAuth: (payload: AuthResponse) => void;
  updateUser: (changes: Partial<User>) => void;
  clearAuth: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
}

function resolveUniversity(user: User): University | null {
  return user.university ?? null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      university: null,
      isAuthenticated: false,

      setAuth: (payload) => {
        set({
          user: payload.user,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          university: resolveUniversity(payload.user),
          isAuthenticated: true,
        });
      },

      updateUser: (changes) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...changes } });
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          university: null,
          isAuthenticated: false,
        });
      },

      hasRole: (...roles) => {
        const { user } = get();
        return user !== null && roles.includes(user.role);
      },

      isAdmin: () => {
        return get().hasRole('university_admin', 'super_admin');
      },
    }),
    {
      name: 'campus-marketplace-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        university: state.university,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}
