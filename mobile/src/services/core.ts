// Adapter-first service core. EVERY backend call in the app flows through
// a module under src/services/* and returns Result<T>. Until a backend is
// linked, services return { ok: false, error: { kind: 'notConfigured', ... } }
// and screens render honest "backend not linked" states. No fake data, ever.

export type BackendErrorKind = 'notConfigured' | 'network' | 'notFound' | 'unknown';

export interface BackendError {
  kind: BackendErrorKind;
  message: string;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: BackendError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<T>(kind: BackendErrorKind, message: string): Result<T> {
  return { ok: false, error: { kind, message } };
}

export function notConfigured<T>(operation: string): Result<T> {
  return err<T>(
    'notConfigured',
    `${operation} needs a linked backend. Nothing was loaded, and nothing was sent.`,
  );
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PageParams {
  cursor?: string;
  limit?: number;
}

export const DEFAULT_PAGE_LIMIT = 20;
