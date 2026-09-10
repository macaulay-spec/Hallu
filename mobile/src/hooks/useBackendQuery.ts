import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Result } from '@/services/core';
import { notConfigured } from '@/services/core';

// Temporary honest plumbing for Phase 0 shells: resolves to a real
// notConfigured Result (with working retry) until each domain ships its
// own service + hook in its phase. Never returns fake items.
export function useNotConfigured(feature: string): UseQueryResult<Result<null>, Error> {
  return useQuery({
    queryKey: ['notConfigured', feature],
    queryFn: async (): Promise<Result<null>> => notConfigured<null>(feature),
  });
}
