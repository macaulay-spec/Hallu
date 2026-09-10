import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { track } from '@/lib/analytics';
import { formatCount } from '@/lib/format';
import { useEpisode, useEpisodePosts } from '@/hooks/useEpisodes';
import { useSetWatching, useWatchProgress } from '@/hooks/useWatching';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PostCard } from '@/components/PostCard';

// Episode Discussion (blueprint 13).
export default function EpisodeDiscussion(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const { id, number } = useLocalSearchParams<{ id: string; number: string }>();
  const episodeNumber = Number.parseInt(number, 10);
  const episode = useEpisode(id, episodeNumber);
  const progress = useWatchProgress(id);
  const tracking = useSetWatching(id);

  const data = episode.data && episode.data.ok ? episode.data.data : null;
  const posts = useEpisodePosts(data?.id ?? '', data !== null);
  const watch = progress.data && progress.data.ok ? progress.data.data : null;
  const safe = watch !== null && watch.watchedThrough >= episodeNumber;

  useEffect(() => {
    track('episode_discussion_opened', { dramaId: id, episode: episodeNumber });
  }, [id, episodeNumber]);

  const items = (posts.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <Screen scroll>
      <ScreenHeader title={`Episode ${number}`} />
      {episode.isPending ? (
        <LoadingState label="Loading episode…" />
      ) : episode.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void episode.refetch()} />
      ) : !data ? (
        <NotConfiguredState feature="Episode discussion" onRetry={() => void episode.refetch()} />
      ) : (
        <View style={styles.wrap}>
          <Card>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {data.title ?? `Episode ${data.number}`}
            </Text>
            <Text style={[styles.meta, { color: theme.colors.textDim }]}>
              {data.airDate ?? 'Air date TBA'} · {formatCount(data.discussionCount)} in discussion
            </Text>
            {data.synopsis ? (
              <Text style={[styles.synopsis, { color: theme.colors.textDim }]}>{data.synopsis}</Text>
            ) : null}
          </Card>
          <Card>
            {watch ? (
              <Text style={[styles.gate, { color: safe ? theme.colors.success : theme.colors.warning }]}>
                {safe
                  ? `You've watched through Ep ${watch.watchedThrough} — safe to discuss`
                  : `Heads up: you've watched through Ep ${watch.watchedThrough}, this is Ep ${data.number}`}
              </Text>
            ) : (
              <View style={styles.gateRow}>
                <Text style={[styles.gate, { color: theme.colors.textDim }]}>
                  Track this drama to unlock spoiler-safe discussion.
                </Text>
                <Button
                  title="Track drama"
                  variant="secondary"
                  onPress={() => void tracking.mutateAsync('watching')}
                  loading={tracking.isPending}
                />
              </View>
            )}
          </Card>
          <Text style={[styles.section, { color: theme.colors.text }]}>Live Reactions</Text>
          {posts.isPending ? (
            <LoadingState label="Loading discussion…" />
          ) : posts.isError ? (
            <ErrorState message="Something went wrong." onRetry={() => void posts.refetch()} />
          ) : !posts.data?.pages[0]?.ok ? (
            <NotConfiguredState feature="Episode discussion" onRetry={() => void posts.refetch()} />
          ) : items.length === 0 ? (
            <EmptyState
              icon="chatbubbles-outline"
              title="No reactions yet"
              message="Be the first to react to this episode."
            />
          ) : (
            items.map((post) => <PostCard key={post.id} post={post} />)
          )}
          {posts.hasNextPage ? (
            <Button
              title="Load more"
              variant="secondary"
              onPress={() => void posts.fetchNextPage()}
              loading={posts.isFetchingNextPage}
            />
          ) : null}
          <Button title="Join the live discussion…" onPress={() => router.push('/compose')} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
    marginTop: 4,
  },
  synopsis: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  gate: {
    fontSize: 14,
    fontWeight: '600',
  },
  gateRow: {
    gap: 12,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
});
