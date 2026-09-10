import type { Result } from './core';
import { notConfigured } from './core';

// Storage upload step of the post/media flows. Returns remote URLs when a
// backend is linked; until then the honest notConfigured error.
export async function uploadImages(localUris: string[]): Promise<Result<string[]>> {
  void localUris;
  return notConfigured<string[]>('Media upload');
}

export async function uploadAvatar(localUri: string): Promise<Result<string>> {
  void localUri;
  return notConfigured<string>('Avatar upload');
}
