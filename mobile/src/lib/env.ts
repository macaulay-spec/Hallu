// The ONLY module allowed to touch process.env (enforced by eslint).
// Access is static so Expo can inline EXPO_PUBLIC_* values at bundle time.

export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  enableVideo: process.env.EXPO_PUBLIC_ENABLE_VIDEO === 'true',
  enablePolls: process.env.EXPO_PUBLIC_ENABLE_POLLS === 'true',
  enableDMs: process.env.EXPO_PUBLIC_ENABLE_DMS === 'true',
} as const;

export function isBackendConfigured(): boolean {
  return env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;
}
