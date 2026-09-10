import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { formatCount } from '@/lib/format';
import { useProfile } from '@/hooks/useProfile';
import { useProfilePosts } from '@/hooks/usePosts';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PreviewBanner } from '@/components/ui/PreviewBanner';
import { PostCard } from '@/components/PostCard';
import { FollowButton } from '@/components/FollowButton';
import { ScreenHeader } from '@/components/ScreenHeader';

interface UserProfileProps {
  username: string;
  isOwn?: boolean;
  showBack?: boolean;
}

// Full profile screen (blueprint 11): cover, stats, follow/edit actions,
// Posts/Saved tabs with infinite lists. Watchlist/Communities tabs arrive
// with Phases 2 and 4.
export function UserProfile({ username, isOwn = false, showBack = false }: UserProfileProps): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const { previewMode } = useAuth();
  const [tab, setTab] = useState('Posts');
  const profile = useProfile(username);
  const posts = useProfilePosts(username);
  const saved = useBookmarks('posts', isOwn);
  const tabs = isOwn ? ['Posts', 'Saved'] : ['Posts'];

  const active = tab === 'Saved' ? saved : posts;
  const firstPage = active.data?.pages[0];
  const items = (active.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  function renderHeader(): ReactNode {
    if (profile.isPending) return <LoadingState label="Loading profile…" />;
    if (profile.isError) {
      return (
        <ErrorState
          message="Something went wrong loading this profile."
          onRetry={() => void profile.refetch()}
        />
      );
    }
    const result = profile.data;
    if (!result || !result.ok) {
      return <NotConfiguredState feature="Profile" onRetry={() => void profile.refetch()} />;
    }
    const data = result.data;
    return (
      <View>
        {previewMode ? <PreviewBanner /> : null}
        <LinearGradient
          colors={[theme.colors.brandDeep, theme.colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cover}
        >
          <Avatar uri={data.avatarUrl} name={data.displayName} size={72} />
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{data.displayName}</Text>
            {data.verified ? (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.brandBlue} accessibilityLabel="Verified" />
            ) : null}
          </View>
          <Text style={[styles.handle, { color: theme.colors.textDim }]}>@{data.username}</Text>
          {data.bio.length > 0 ? (
            <Text style={[styles.bio, { color: theme.colors.textDim }]}>{data.bio}</Text>
          ) : null}
        </LinearGradient>
        <View style={styles.stats}>
          <Pressable
            onPress={() => router.push(`/user/${username}/following`)}
            accessibilityRole="link"
            accessibilityLabel={`${data.followingCount} following`}
            style={styles.stat}
          >
            <Text style={[styles.statCount, { color: theme.colors.text }]}>
              {formatCount(data.followingCount)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Following</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/user/${username}/followers`)}
            accessibilityRole="link"
            accessibilityLabel={`${data.followerCount} followers`}
            style={styles.stat}
          >
            <Text style={[styles.statCount, { color: theme.colors.text }]}>
              {formatCount(data.followerCount)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Followers</Text>
          </Pressable>
          <View style={styles.stat} accessibilityLabel={`${data.likesCount} likes`}>
            <Text style={[styles.statCount, { color: theme.colors.text }]}>
              {formatCount(data.likesCount)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Likes</Text>
          </View>
        </View>
        <View style={styles.actions}>
          {isOwn ? (
            <View style={styles.ownActions}>
              <View style={styles.ownAction}>
                <Button
                  title="Edit profile"
                  variant="secondary"
                  onPress={() => router.push('/edit-profile')}
                />
              </View>
              <View style={styles.ownAction}>
            <Button
              title="Currently Watching"
              variant="secondary"
              onPress={() => router.push('/watching')}
            />
            <Button
              title="Communities"
              variant="secondary"
              onPress={() => router.push('/communities')}
            />
          </View>
            </View>
          ) : (
            <FollowButton username={username} following={false} />
          )}
        </View>
        <SegmentedControl
          options={tabs}
          value={tab}
          onChange={setTab}
          accessibilityLabel="Profile content"
        />
      </View>
    );
  }

  function renderEmpty(): ReactNode {
    if (active.isPending) return <LoadingState label="Loading…" />;
    if (active.isError) {
      return (
        <ErrorState
          message="Something went wrong."
          onRetry={() => void active.refetch()}
        />
      );
    }
    if (firstPage && !firstPage.ok) {
      return (
        <NotConfiguredState
          feature={tab === 'Saved' ? 'Saved posts' : 'Posts'}
          onRetry={() => void active.refetch()}
        />
      );
    }
    return (
      <EmptyState
        icon="document-text-outline"
        title={tab === 'Saved' ? 'Nothing saved yet' : 'No posts yet'}
        message={
          tab === 'Saved'
            ? 'Bookmark posts to find them here.'
            : 'Your fandom is quiet here. Follow a few dramas or communities to get things moving.'
        }
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {showBack ? (
        <View style={styles.backHeader}>
          <ScreenHeader title={`@${username}`} />
        </View>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <PostCard post={item} />
          </View>
        )}
        ListHeaderComponent={<View style={styles.header}>{renderHeader()}</View>}
        ListEmptyComponent={<>{renderEmpty()}</>}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (active.hasNextPage && !active.isFetchingNextPage) void active.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  backHeader: {
    paddingHorizontal: 16,
  },
  list: {
    flexGrow: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
  },
  cover: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  handle: {
    fontSize: 14,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  actions: {
    gap: 8,
  },
  ownActions: {
    flexDirection: 'row',
    gap: 8,
  },
  ownAction: {
    flex: 1,
  },
});
