import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addRule,
  banMember,
  createCommunity,
  deleteRule,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  listCommunities,
  listCommunityPosts,
  listJoinRequests,
  listMembers,
  listRules,
  pinPost,
  removePostFromCommunity,
  requestJoin,
  resolveJoinRequest,
  setMemberRole,
  unbanMember,
} from '@/services/communities';
import type { CreateCommunityInput } from '@/services/communities';

export interface CommunityFilter {
  query?: string;
  joinedOnly?: boolean;
}

export function useCommunities(filter: CommunityFilter) {
  return useInfiniteQuery({
    queryKey: ['communities', filter.query ?? '', filter.joinedOnly ?? false],
    queryFn: ({ pageParam }) =>
      listCommunities({ query: filter.query, joinedOnly: filter.joinedOnly, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useCommunity(communityId: string) {
  return useQuery({
    queryKey: ['community', communityId],
    queryFn: () => getCommunity(communityId),
  });
}

export function useCommunityPosts(communityId: string) {
  return useInfiniteQuery({
    queryKey: ['communityPosts', communityId],
    queryFn: ({ pageParam }) => listCommunityPosts(communityId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useCommunityMembers(communityId: string) {
  return useInfiniteQuery({
    queryKey: ['communityMembers', communityId],
    queryFn: ({ pageParam }) => listMembers(communityId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useCommunityRules(communityId: string) {
  return useQuery({
    queryKey: ['communityRules', communityId],
    queryFn: () => listRules(communityId),
  });
}

export function useJoinRequests(communityId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['joinRequests', communityId],
    queryFn: () => listJoinRequests(communityId),
    enabled,
  });
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommunityInput) => createCommunity(input),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useJoinCommunity(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => joinCommunity(communityId),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['community', communityId] });
        void queryClient.invalidateQueries({ queryKey: ['communities'] });
      }
    },
  });
}

export function useRequestJoin(communityId: string) {
  return useMutation({
    mutationFn: () => requestJoin(communityId),
  });
}

export function useLeaveCommunity(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveCommunity(communityId),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['community', communityId] });
        void queryClient.invalidateQueries({ queryKey: ['communities'] });
      }
    },
  });
}

export function usePinToggle(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, pinned }: { postId: string; pinned: boolean }) =>
      pinPost(communityId, postId, pinned),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['communityPosts', communityId] });
    },
  });
}

export function useRemoveCommunityPost(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => removePostFromCommunity(communityId, postId),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['communityPosts', communityId] });
    },
  });
}

export function useSetMemberRole(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role: 'member' | 'moderator' }) =>
      setMemberRole(communityId, username, role),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['communityMembers', communityId] });
    },
  });
}

export function useBanToggle(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, banned }: { username: string; banned: boolean }) =>
      banned ? unbanMember(communityId, username) : banMember(communityId, username),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['communityMembers', communityId] });
    },
  });
}

export function useAddRule(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => addRule(communityId, text),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['communityRules', communityId] });
    },
  });
}

export function useDeleteRule(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => deleteRule(communityId, ruleId),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['communityRules', communityId] });
    },
  });
}

export function useResolveJoinRequest(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, approve }: { username: string; approve: boolean }) =>
      resolveJoinRequest(communityId, username, approve),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['joinRequests', communityId] });
        void queryClient.invalidateQueries({ queryKey: ['communityMembers', communityId] });
      }
    },
  });
}
