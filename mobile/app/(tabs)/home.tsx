import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useFollowingFeed, useForYou } from '@/hooks/useFeeds';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PreviewBanner } from '@/components/ui/PreviewBanner';
import { PostCard } from '@/components/PostCard';

// Home · For You / Following (blueprints 06/07).
export default function Home(): ReactNode {
  const theme = useTheme();
  const { previewMode } = useAuth();
  const [feed, setFeed] = useState('For You');
  const forYou = useForYou();
  const following = useFollowingFeed();
  const active = feed === 'For You' ? forYou : following;

  const firstPage = active.data?.pages[0];
  const items = (active.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  function renderEmpty(): ReactNode {
    if (active.isPending) return <LoadingState label="Loading your feed…" />;
    if (active.isError) {
      return (
        <ErrorState
          message="Something went wrong loading your feed."
          onRetry={() => void active.refetch()}
        />
      );
    }
    if (firstPage && !firstPage.ok) {
      return (
        <NotConfiguredState
          feature={feed === 'For You' ? 'For You feed' : 'Following feed'}
          onRetry={() => void active.refetch()}
        />
      );
    }
    return (
      <EmptyState
        icon="newspaper-outline"
        title="Your fandom is quiet here"
        message="Follow a few dramas or communities to get things moving."
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.inner}>
        {previewMode ? <PreviewBanner /> : null}
        <Text style={[styles.header, { color: theme.colors.text }]}>Hallyu</Text>
        <SegmentedControl
          options={['For You', 'Following']}
          value={feed}
          onChange={setFeed}
          accessibilityLabel="Feed selector"
        />
        <FlatList
          data={items}
          keyExtractor={(post) => post.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <PostCard post={item} />
            </View>
          )}
          ListEmptyComponent={<>{renderEmpty()}</>}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={active.isRefetching}
              onRefresh={() => void active.refetch()}
              tintColor={theme.colors.brandBlue}
            />
          }
          onEndReached={() => {
            if (active.hasNextPage && !active.isFetchingNextPage) void active.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
  },
  list: {
    flexGrow: 1,
    gap: 12,
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
});
