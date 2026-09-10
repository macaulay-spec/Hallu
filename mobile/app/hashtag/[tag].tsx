import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { formatCount } from '@/lib/format';
import { useHashtag, useHashtagPosts } from '@/hooks/useHashtag';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PostCard } from '@/components/PostCard';

// Hashtag Page, basic (blueprint 22). Related topics + trending arrive
// with Phase 3 discovery.
export default function HashtagScreen(): ReactNode {
  const theme = useTheme();
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const info = useHashtag(tag);
  const feed = useHashtagPosts(tag);

  const firstPage = feed.data?.pages[0];
  const items = (feed.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <Screen>
      <ScreenHeader title={`#${tag}`} />
      {info.data && info.data.ok ? (
        <View style={styles.info}>
          <Ionicons name="pricetag" size={28} color={theme.colors.brandBlue} />
          <Text style={[styles.counts, { color: theme.colors.textDim }]}>
            {formatCount(info.data.data.postCount)} posts · {formatCount(info.data.data.followerCount)} fans
          </Text>
          {info.data.data.description.length > 0 ? (
            <Text style={[styles.desc, { color: theme.colors.textDim }]}>
              {info.data.data.description}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View style={styles.list}>
        {feed.isPending ? (
          <LoadingState label="Loading hashtag feed…" />
        ) : feed.isError ? (
          <ErrorState
            message="Something went wrong."
            onRetry={() => void feed.refetch()}
          />
        ) : firstPage && !firstPage.ok ? (
          <NotConfiguredState feature="Hashtag feed" onRetry={() => void feed.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="pricetag"
            title="No posts yet"
            message="Be the first to post with this hashtag."
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
              if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  counts: {
    fontSize: 14,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
  },
});
