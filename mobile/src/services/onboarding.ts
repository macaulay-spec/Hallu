import type { Result } from './core';
import { notConfigured } from './core';

export async function saveInterests(genres: string[]): Promise<Result<null>> {
  void genres;
  return notConfigured<null>('Save interests');
}

export async function completeOnboarding(): Promise<Result<null>> {
  return notConfigured<null>('Complete onboarding');
}
