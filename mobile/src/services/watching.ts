import type { Result } from './core';
import { notConfigured } from './core';

export type WatchingStatus = 'watching' | 'completed';

export interface WatchingEntry {
  dramaId: string;
  title: string;
  posterUrl: string | null;
  episodeCount: number | null;
  watchedThrough: number;
  status: WatchingStatus;
  updatedAt: string;
}

export async function listWatching(): Promise<Result<WatchingEntry[]>> {
  return notConfigured<WatchingEntry[]>('Currently watching');
}

export async function getWatchProgress(dramaId: string): Promise<Result<WatchingEntry | null>> {
  void dramaId;
  return notConfigured<WatchingEntry | null>('Watch progress');
}

// status null removes the drama from tracking.
export async function setWatching(
  dramaId: string,
  status: WatchingStatus | null,
): Promise<Result<null>> {
  void dramaId;
  void status;
  return notConfigured<null>('Track drama');
}

export async function setWatchedThrough(dramaId: string, episode: number): Promise<Result<null>> {
  void dramaId;
  void episode;
  return notConfigured<null>('Update progress');
}
