import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  blockUser,
  listBlockedUsers,
  listMutedUsers,
  muteUser,
  unblockUser,
  unmuteUser,
} from '@/services/blocks';
import { listMyReports, submitReport } from '@/services/reports';
import type { ReportReason, ReportTargetType } from '@/services/reports';

export function useBlockedUsers() {
  return useInfiniteQuery({
    queryKey: ['blockedUsers'],
    queryFn: ({ pageParam }) => listBlockedUsers({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useMutedUsers() {
  return useInfiniteQuery({
    queryKey: ['mutedUsers'],
    queryFn: ({ pageParam }) => listMutedUsers({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useMyReports() {
  return useInfiniteQuery({
    queryKey: ['myReports'],
    queryFn: ({ pageParam }) => listMyReports({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useBlockToggle(username: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blocked: boolean) => (blocked ? unblockUser(username) : blockUser(username)),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
    },
  });
}

export function useMuteToggle(username: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (muted: boolean) => (muted ? unmuteUser(username) : muteUser(username)),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['mutedUsers'] });
    },
  });
}

export interface SubmitReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitReportInput) =>
      submitReport(input.targetType, input.targetId, input.reason, input.details),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['myReports'] });
    },
  });
}
