import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import type { BookmarkFilter } from '@/services/bookmarks';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Chip } from '@/components/ui/Chip';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PostCard } from '@/components/PostCard';

interface SavedFilter {
  label: string;
  value: BookmarkFilter;
}

const FILTERS: SavedFilter[] = [
  { label: 'All', value: 'all' },
  { label: 'Posts', value: 'posts' },
  { label: 'Dramas', value: 'dramas' },
  { label: 'Episodes', value: 'episodes' },
];

// Saved / Bookmarks (blueprint 23).
export default function Saved(): ReactNode {
  const [filter, setFilter] = useState<BookmarkFilter>('all');
  const query = useBookmarks(filter);

  const firstPage = query.data?.pages[0];
  const items = (query.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <Screen>
      <ScreenHeader title="Saved" />
      <View style={styles.chips}>
        {FILTERS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={filter === option.value}
            onPress={() => setFilter(option.value)}
          />
        ))}
      </View>
      <View style={styles.list}>
        {query.isPending ? (
          <LoadingState label="Loading saved…" />
        ) : query.isError ? (
          <ErrorState
            message="Something went wrong loading saved posts."
            onRetry={() => void query.refetch()}
          />
        ) : firstPage && !firstPage.ok ? (
          <NotConfiguredState feature="Saved posts" onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="bookmark-outline"
            title="You're all caught up"
            message="Bookmark posts to find them here."
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(post) => post.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <PostCard post={item} />
              </View>
            )}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  card: {
    marginBottom: 12,
  },
});
