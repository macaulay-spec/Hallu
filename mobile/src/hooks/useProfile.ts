import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOwnProfile, getProfile, updateProfile } from '@/services/profiles';
import type { UpdateProfileInput } from '@/services/profiles';

export function useProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => getProfile(username),
  });
}

export function useOwnProfile() {
  return useQuery({ queryKey: ['profile', 'me'], queryFn: getOwnProfile });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
