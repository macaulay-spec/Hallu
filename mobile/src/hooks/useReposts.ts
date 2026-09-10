import { useMutation, useQueryClient } from '@tanstack/react-query';
import { repost, unrepost } from '@/services/reposts';

export function useRepostToggle(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reposted: boolean) => (reposted ? unrepost(postId) : repost(postId)),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['post', postId] });
        void queryClient.invalidateQueries({ queryKey: ['feed'] });
        void queryClient.invalidateQueries({ queryKey: ['profilePosts'] });
      }
    },
  });
}
