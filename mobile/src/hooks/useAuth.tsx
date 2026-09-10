import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';
import type { Result } from '@/services/core';
import type { Session } from '@/services/auth';
import {
  getSession,
  sendPasswordReset as resetService,
  signIn as signInService,
  signOut as signOutService,
  signUp as signUpService,
} from '@/services/auth';

export type AuthStatus = 'loading' | 'signedOut' | 'preview' | 'authenticated';

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  previewMode: boolean;
  onboardingCompleted: boolean;
  signUp: (email: string, password: string) => Promise<Result<Session>>;
  signIn: (email: string, password: string) => Promise<Result<Session>>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<Result<null>>;
  enterPreviewMode: () => void;
  exitPreviewMode: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SPLASH_MIN_MS = 900;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function restore(): Promise<void> {
      const [result] = await Promise.all([getSession(), delay(SPLASH_MIN_MS)]);
      if (cancelled) return;
      if (result.ok && result.data) {
        setSession(result.data);
        setStatus('authenticated');
      } else {
        // No backend (or no session) means signed out. Never invent a session.
        setStatus('signedOut');
      }
      track('app_opened');
    }
    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const result = await signUpService(email, password);
    if (result.ok) {
      setSession(result.data);
      setStatus('authenticated');
    }
    return result;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInService(email, password);
    if (result.ok) {
      setSession(result.data);
      setStatus('authenticated');
    }
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await signOutService();
    setSession(null);
    setOnboardingCompleted(false);
    setStatus('signedOut');
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => resetService(email), []);

  const enterPreviewMode = useCallback(() => {
    // Preview mode is explicitly navigation-only: no identity, no data.
    // Every screen keeps showing honest "backend not linked" states.
    setStatus('preview');
  }, []);

  const exitPreviewMode = useCallback(() => {
    setOnboardingCompleted(false);
    setStatus('signedOut');
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted(true);
    track('onboarding_completed');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      previewMode: status === 'preview',
      onboardingCompleted,
      signUp,
      signIn,
      signOut,
      sendPasswordReset,
      enterPreviewMode,
      exitPreviewMode,
      completeOnboarding,
    }),
    [
      status,
      session,
      onboardingCompleted,
      signUp,
      signIn,
      signOut,
      sendPasswordReset,
      enterPreviewMode,
      exitPreviewMode,
      completeOnboarding,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
