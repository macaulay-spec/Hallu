// Client-side spoiler visibility. Mirrors the server gate (migrations +
// FIREBASE_BACKEND_PROMPT): hidden unless spoiler mode is off or the user
// has watched through at least the spoiler episode. The server is the
// real enforcement; this only decides what the UI renders.

export type SpoilerMode = 'on' | 'off';

export function isSpoilerHidden(
  spoilerEpisode: number | null,
  watchedThrough: number | null,
  mode: SpoilerMode,
): boolean {
  if (spoilerEpisode === null) return false;
  if (mode === 'off') return false;
  if (watchedThrough === null) return true;
  return watchedThrough < spoilerEpisode;
}
