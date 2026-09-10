import { useState } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { formatCount, timeAgo } from '@/lib/format';
import { track } from '@/lib/analytics';
import type { Post } from '@/services/posts';
import { useRepostToggle } from '@/hooks/useReposts';
import { useBookmarkToggle } from '@/hooks/useBookmarks';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { ParsedText } from '@/components/ParsedText';
import { ReactionBar } from '@/components/ReactionBar';
import { SpoilerGate } from '@/components/SpoilerGate';

interface PostCardProps {
  post: Post;
  detail?: boolean;
}

// Feed item (spec §51): avatar, handle, timestamp, drama/episode context,
// text, media, spoiler overlay, action row. The context chip deep-links to
// the drama hub; the body opens post detail.
export function PostCard({ post, detail = false }: PostCardProps): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const repost = useRepostToggle(post.id);
  const bookmark = useBookmarkToggle(post.id);
  const [error, setError] = useState<string | null>(null);

  const context = [
    timeAgo(post.createdAt),
    post.dramaTag?.title,
    post.episodeTag ? `Ep ${post.episodeTag.number}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  function openDetail(): void {
    if (!detail) router.push(`/post/${post.id}`);
  }

  function openDrama(): void {
    if (post.dramaTag) router.push(`/drama/${post.dramaTag.dramaId}`);
  }

  async function handleRepost(): Promise<void> {
    setError(null);
    const result = await repost.mutateAsync(post.viewerReposted);
    if (!result.ok) setError(result.error.message);
    else track('repost_created', { postId: post.id });
  }

  async function handleBookmark(): Promise<void> {
    setError(null);
    const result = await bookmark.mutateAsync(post.viewerBookmarked);
    if (!result.ok) setError(result.error.message);
    else track('bookmark_created', { postId: post.id });
  }

  async function handleShare(): Promise<void> {
    try {
      await Share.share({ message: `Hallyu post by @${post.author.username}` });
      track('post_shared', { postId: post.id });
    } catch {
      setError('Sharing is not available right now.');
    }
  }

  return (
    <Card>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push(`/user/${post.author.username}`)}
          accessibilityRole="link"
          accessibilityLabel={`View ${post.author.username}`}
        >
          <Avatar uri={post.author.avatarUrl} name={post.author.displayName} size={40} />
        </Pressable>
        <View style={styles.headerText}>
          <Pressable
            onPress={() => router.push(`/user/${post.author.username}`)}
            accessibilityRole="link"
            accessibilityLabel={`View ${post.author.username}`}
          >
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {post.author.displayName}{' '}
              <Text style={{ color: theme.colors.textMuted }}>@{post.author.username}</Text>
            </Text>
          </Pressable>
          {post.dramaTag ? (
            <Pressable
              onPress={openDrama}
              accessibilityRole="link"
              accessibilityLabel={`Open ${post.dramaTag.title}`}
            >
              <Text style={[styles.context, { color: theme.colors.brandBlue }]}>{context}</Text>
            </Pressable>
          ) : (
            <Text style={[styles.context, { color: theme.colors.textMuted }]}>{context}</Text>
          )}
        </View>
      </View>
      <View style={styles.badges}>
        <Text style={[styles.category, { color: theme.colors.brandBlue }]}>
          {post.category.toUpperCase()}
        </Text>
        {post.spoilerEpisode !== null ? (
          <Text style={[styles.spoiler, { color: theme.colors.accent }]}>SPOILER</Text>
        ) : null}
      </View>
      <Pressable
        onPress={openDetail}
        accessibilityRole={detail ? undefined : 'button'}
        accessibilityLabel={detail ? undefined : `Open post by ${post.author.username}`}
      >
        <SpoilerGate spoilerEpisode={post.spoilerEpisode}>
          <ParsedText text={post.text} />
          {post.mediaUrls.length > 0 ? (
            <ScrollView horizontal style={styles.media} showsHorizontalScrollIndicator={false}>
              {post.mediaUrls.map((uri) => (
                <Image
                  key={uri}
                  source={{ uri }}
                  accessibilityLabel="Post image"
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : null}
        </SpoilerGate>
      </Pressable>
      <ReactionBar post={post} />
      <View style={styles.actions}>
        <Pressable
          onPress={openDetail}
          accessibilityRole="button"
          accessibilityLabel={`${post.commentCount} comments`}
          style={styles.action}
        >
          <Ionicons name="chatbubble-outline" size={20} color={theme.colors.textMuted} />
          <Text style={[styles.actionCount, { color: theme.colors.textDim }]}>
            {formatCount(post.commentCount)}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => void handleRepost()}
          accessibilityRole="button"
          accessibilityLabel={post.viewerReposted ? 'Undo repost' : 'Repost'}
          accessibilityState={{ selected: post.viewerReposted }}
          style={styles.action}
        >
          <Ionicons
            name="repeat-outline"
            size={20}
            color={post.viewerReposted ? theme.colors.success : theme.colors.textMuted}
          />
          <Text style={[styles.actionCount, { color: theme.colors.textDim }]}>
            {formatCount(post.repostCount)}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => void handleBookmark()}
          accessibilityRole="button"
          accessibilityLabel={post.viewerBookmarked ? 'Remove bookmark' : 'Bookmark'}
          accessibilityState={{ selected: post.viewerBookmarked }}
          style={styles.action}
        >
          <Ionicons
            name={post.viewerBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={post.viewerBookmarked ? theme.colors.brandBlue : theme.colors.textMuted}
          />
        </Pressable>
        <Pressable
          onPress={() => void handleShare()}
          accessibilityRole="button"
          accessibilityLabel="Share post"
          style={styles.action}
        >
          <Ionicons name="share-outline" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  context: {
    fontSize: 13,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  category: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  spoiler: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  media: {
    marginTop: 10,
  },
  image: {
    width: 240,
    height: 160,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#262626',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 6,
  },
  actionCount: {
    fontSize: 13,
  },
  error: {
    fontSize: 13,
    marginTop: 4,
  },
});
