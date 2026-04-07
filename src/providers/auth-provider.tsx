'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Handles authentication state initialization and route protection
 *
 * This component:
 * 1. Waits for Zustand to hydrate from localStorage (prevents race conditions)
 * 2. Validates the stored token with the backend
 * 3. Redirects unauthenticated users to login
 * 4. Shows loading state while checking auth
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isHydrated,
    isAuthenticated,
    tokens,
    checkAuth,
    isLoading,
  } = useAuthStore();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    if (!isHydrated) {
      return;
    }

    const validateAuth = async () => {
      // If we have tokens stored, validate them with the backend
      if (tokens?.accessToken) {
        try {
          await checkAuth();
        } catch (error) {
          console.error('Auth validation failed:', error);
        }
      }
      setIsCheckingAuth(false);
    };

    validateAuth();
  }, [isHydrated, tokens?.accessToken, checkAuth]);

  // While hydrating or checking auth, show loading
  if (!isHydrated || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-foreground/70">Loading...</p>
        </div>
      </div>
    );
  }

  // After hydration, if not authenticated and not on login page, redirect
  if (!isAuthenticated && !pathname?.startsWith('/login')) {
    // Use setTimeout to avoid SSR hydration issues
    if (typeof window !== 'undefined') {
      router.push('/login');
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-foreground/70">Redirecting to login...</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * AuthGuard - Simpler version that just blocks rendering until auth is ready
 * Use this in dashboard layout to prevent content flash
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isHydrated, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Don't render children until we know auth state
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
