import { isBackendConfigured } from '@/lib/env';
import type { Result } from './core';
import { notConfigured } from './core';

export interface Session {
  userId: string;
  email: string;
}

export async function getSession(): Promise<Result<Session | null>> {
  if (!isBackendConfigured()) return notConfigured<Session | null>('Session restore');
  return notConfigured<Session | null>('Session restore');
}

export async function signUp(email: string, _password: string): Promise<Result<Session>> {
  void email;
  if (!isBackendConfigured()) return notConfigured<Session>('Sign up');
  return notConfigured<Session>('Sign up');
}

export async function signIn(email: string, _password: string): Promise<Result<Session>> {
  void email;
  if (!isBackendConfigured()) return notConfigured<Session>('Sign in');
  return notConfigured<Session>('Sign in');
}

export async function signInWithProvider(
  provider: 'google' | 'apple',
): Promise<Result<Session>> {
  if (!isBackendConfigured()) return notConfigured<Session>(`Sign in with ${provider}`);
  return notConfigured<Session>(`Sign in with ${provider}`);
}

export async function signOut(): Promise<Result<null>> {
  if (!isBackendConfigured()) return notConfigured<null>('Sign out');
  return notConfigured<null>('Sign out');
}

export async function sendPasswordReset(email: string): Promise<Result<null>> {
  void email;
  if (!isBackendConfigured()) return notConfigured<null>('Password reset');
  return notConfigured<null>('Password reset');
}
