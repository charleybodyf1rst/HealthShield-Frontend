'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthTokens, AuthState } from '@/types/auth';
import { authApi } from '@/lib/api';
import { clearAllKeys } from '@/lib/encryption';

interface AuthStore extends AuthState {
  // Hydration state - tracks when localStorage has been loaded
  isHydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      // Hydration tracking - starts false, becomes true when localStorage loaded
      isHydrated: false,
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),

      // Login
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('[Auth] Attempting login for:', email);
          const { user, tokens } = await authApi.login(email, password);
          console.log('[Auth] Login API success, user:', user?.email, 'token:', tokens?.accessToken?.substring(0, 20));
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          console.log('[Auth] State updated, isAuthenticated: true');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          console.error('[Auth] Login failed:', message, error);
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore logout errors
        }

        // Clear encryption keys
        try {
          await clearAllKeys();
        } catch {
          // Ignore errors
        }

        // Clear auth-token cookie used by middleware
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-token=; path=/; max-age=0';
        }

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // Check authentication status
      checkAuth: async () => {
        const { tokens } = get();
        if (!tokens?.accessToken) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authApi.me();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token invalid or expired
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Update user
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'healthshield-crm-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      // Called when Zustand has finished loading state from localStorage
      onRehydrateStorage: () => (state) => {
        // Mark hydration as complete - now safe to make auth decisions
        state?.setHydrated(true);
      },
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsHydrated = () => useAuthStore((state) => state.isHydrated);
