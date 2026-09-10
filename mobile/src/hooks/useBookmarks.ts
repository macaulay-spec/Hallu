import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addBookmark, listBookmarks, removeBookmark } from '@/services/bookmarks';
import type { BookmarkFilter } from '@/services/bookmarks';

export function useBookmarks(filter: BookmarkFilter, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['bookmarks', filter],
    enabled,
    queryFn: ({ pageParam }) => listBookmarks(filter, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useBookmarkToggle(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookmarked: boolean) =>
      bookmarked ? removeBookmark(postId) : addBookmark(postId),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        void queryClient.invalidateQueries({ queryKey: ['post', postId] });
      }
    },
  });
}
