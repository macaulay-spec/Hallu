import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useTrendingHashtags, useTrendingPosts } from '@/hooks/useTrending';
import { useDramas } from '@/hooks/useDramas';
import { useNotConfigured } from '@/hooks/useBackendQuery';
import { Screen } from '@/components/ui/Screen';
import { Chip } from '@/components/ui/Chip';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PreviewBanner } from '@/components/ui/PreviewBanner';
import { PostCard } from '@/components/PostCard';
import { DramaCard } from '@/components/drama/DramaCard';

// Explore (blueprint 08): search entry, trending topics, Current Wave,
// Trending Now, Popular Communities (communities wire up in Phase 4).
export default function Explore(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const { previewMode } = useAuth();
  const tags = useTrendingHashtags(8);
  const airing = useDramas({ status: 'airing' });
  const trending = useTrendingPosts();
  const communities = useNotConfigured('Popular communities');

  const tagItems = tags.data && tags.data.ok ? tags.data.data : null;
  const airingItems = (airing.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );
  const trendingItems = (trending.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <Screen scroll>
      {previewMode ? <PreviewBanner /> : null}
      <Text style={[styles.header, { color: theme.colors.text }]}>Explore</Text>
      <Pressable
        onPress={() => router.push('/search')}
        accessibilityRole="button"
        accessibilityLabel="Search dramas, stars, posts"
        style={[styles.searchBox, { backgroundColor: theme.colors.surface }]}
      >
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <Text style={[styles.searchHint, { color: theme.colors.textMuted }]}>
          Search dramas, stars, posts…
        </Text>
      </Pressable>

      <Text style={[styles.section, { color: theme.colors.text }]}>Trending Today</Text>
      {tags.isPending ? (
        <LoadingState label="Loading trending…" />
      ) : tags.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void tags.refetch()} />
      ) : !tagItems ? (
        <NotConfiguredState feature="Trending topics" onRetry={() => void tags.refetch()} />
      ) : tagItems.length === 0 ? (
        <EmptyState icon="flame-outline" title="Nothing trending" message="Check back soon." />
      ) : (
        <View style={styles.pills}>
          {tagItems.map((item) => (
            <Chip
              key={item.tag}
              label={`#${item.tag}`}
              onPress={() => router.push(`/hashtag/${encodeURIComponent(item.tag)}`)}
            />
          ))}
        </View>
      )}

      <Text style={[styles.section, { color: theme.colors.text }]}>Current Wave</Text>
      {airing.isPending ? (
        <LoadingState label="Loading airing dramas…" />
      ) : airing.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void airing.refetch()} />
      ) : !airing.data?.pages[0]?.ok ? (
        <NotConfiguredState feature="Currently airing" onRetry={() => void airing.refetch()} />
      ) : airingItems.length === 0 ? (
        <EmptyState icon="tv-outline" title="No airing dramas" message="Check back soon." />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rail}>
          {airingItems.map((drama) => (
            <View key={drama.id} style={styles.railItem}>
              <DramaCard drama={drama} />
            </View>
          ))}
        </ScrollView>
      )}

      <Text style={[styles.section, { color: theme.colors.text }]}>Trending Now</Text>
      {trending.isPending ? (
        <LoadingState label="Loading trending posts…" />
      ) : trending.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void trending.refetch()} />
      ) : !trending.data?.pages[0]?.ok ? (
        <NotConfiguredState feature="Trending posts" onRetry={() => void trending.refetch()} />
      ) : trendingItems.length === 0 ? (
        <EmptyState icon="flame-outline" title="Nothing trending" message="Check back soon." />
      ) : (
        <View style={styles.list}>
          {trendingItems.slice(0, 5).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      )}

      <Text style={[styles.section, { color: theme.colors.text }]}>Popular Communities</Text>
      {communities.isPending ? (
        <LoadingState label="Loading communities…" />
      ) : (
        <NotConfiguredState
          feature="Popular communities"
          onRetry={() => void communities.refetch()}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  searchHint: {
    fontSize: 15,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rail: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  railItem: {
    width: 260,
    marginRight: 8,
  },
  list: {
    gap: 12,
  },
});
