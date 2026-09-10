import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { usePost, useDeletePost } from '@/hooks/usePosts';
import { useOwnProfile } from '@/hooks/useProfile';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PostCard } from '@/components/PostCard';
import { CommentThread } from '@/components/CommentThread';

// Post Detail + Comments (blueprint 14).
export default function PostDetail(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = usePost(id);
  const remove = useDeletePost();
  const own = useOwnProfile();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewerUsername =
    own.data && own.data.ok ? own.data.data.username : undefined;

  async function handleDelete(): Promise<void> {
    setConfirming(false);
    setError(null);
    const result = await remove.mutateAsync(id);
    if (result.ok) {
      router.back();
    } else {
      setError(result.error.message);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Post" />
      {query.isPending ? (
        <LoadingState label="Loading post…" />
      ) : query.isError ? (
        <ErrorState
          message="Something went wrong loading this post."
          onRetry={() => void query.refetch()}
        />
      ) : !query.data || !query.data.ok ? (
        <NotConfiguredState feature="Post" onRetry={() => void query.refetch()} />
      ) : (
        <View style={styles.wrap}>
          <PostCard post={query.data.data} detail />
          {viewerUsername !== undefined &&
          query.data.data.author.username === viewerUsername ? (
            <Button title="Delete post" variant="danger" onPress={() => setConfirming(true)} />
          ) : null}
          {error ? (
            <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
              {error}
            </Text>
          ) : null}
          <CommentThread postId={id} viewerUsername={viewerUsername} />
        </View>
      )}
      <ConfirmDialog
        visible={confirming}
        title="Delete post?"
        message="This cannot be undone."
        confirmTitle="Delete"
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  error: {
    fontSize: 14,
  },
});
