import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getVerificationStatus,
  listOfficialAccounts,
  requestVerification,
} from '@/services/verification';
import type { VerificationRequestInput } from '@/services/verification';

export function useVerificationStatus() {
  return useQuery({
    queryKey: ['verificationStatus'],
    queryFn: () => getVerificationStatus(),
  });
}

export function useRequestVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VerificationRequestInput) => requestVerification(input),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['verificationStatus'] });
    },
  });
}

export function useOfficialAccounts() {
  return useInfiniteQuery({
    queryKey: ['officialAccounts'],
    queryFn: ({ pageParam }) => listOfficialAccounts({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}
