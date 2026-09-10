import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { track } from '@/lib/analytics';
import { formatCount } from '@/lib/format';
import type { PostCategory } from '@/services/posts';
import { useDrama, useDramaFollowToggle, useDramaPosts } from '@/hooks/useDramas';
import { useDramaCast } from '@/hooks/useActors';
import { useDramaEpisodes } from '@/hooks/useEpisodes';
import { useSetWatching, useWatchProgress } from '@/hooks/useWatching';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PostCard } from '@/components/PostCard';
import { EpisodeRow } from '@/components/drama/EpisodeRow';
import { ActorCard } from '@/components/drama/ActorCard';

interface CommunityTab {
  label: string;
  category: PostCategory | null;
}

// Community tabs mapped onto post categories (Official filters to News
// until the Phase 5 official-accounts flag exists).
const COMMUNITY_TABS: CommunityTab[] = [
  { label: 'All', category: null },
  { label: 'Discussions', category: 'Discussion' },
  { label: 'Theories', category: 'Theory' },
  { label: 'Memes', category: 'Meme' },
  { label: 'Edits', category: 'Fan content' },
  { label: 'Official', category: 'News' },
];

// Drama Hub (blueprint 12).
export default function DramaHub(): ReactNode {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const drama = useDrama(id);
  const cast = useDramaCast(id);
  const episodes = useDramaEpisodes(id);
  const progress = useWatchProgress(id);
  const follow = useDramaFollowToggle(id);
  const tracking = useSetWatching(id);
  const [tabLabel, setTabLabel] = useState('All');
  const tab = COMMUNITY_TABS.find((option) => option.label === tabLabel);
  const posts = useDramaPosts(id, tab?.category ?? null);
  const [error, setError] = useState<string | null>(null);

  const data = drama.data && drama.data.ok ? drama.data.data : null;
  const watch = progress.data && progress.data.ok ? progress.data.data : null;

  async function handleFollow(): Promise<void> {
    if (!data) return;
    setError(null);
    const result = await follow.mutateAsync(data.viewerFollowing);
    if (!result.ok) {
      setError(result.error.message);
    } else if (!data.viewerFollowing) {
      track('drama_followed', { dramaId: id });
    }
  }

  async function handleTrack(): Promise<void> {
    setError(null);
    const result = await tracking.mutateAsync(watch ? null : 'watching');
    if (!result.ok) setError(result.error.message);
  }

  if (drama.isPending) {
    return (
      <Screen>
        <ScreenHeader title="Drama" />
        <LoadingState label="Loading drama…" />
      </Screen>
    );
  }
  if (drama.isError) {
    return (
      <Screen>
        <ScreenHeader title="Drama" />
        <ErrorState message="Something went wrong." onRetry={() => void drama.refetch()} />
      </Screen>
    );
  }
  if (!data) {
    return (
      <Screen>
        <ScreenHeader title="Drama" />
        <NotConfiguredState feature="Drama hub" onRetry={() => void drama.refetch()} />
      </Screen>
    );
  }

  const postItems = (posts.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <Screen scroll>
      <ScreenHeader title={data.title} />
      {data.backdropUrl ? (
        <Image source={{ uri: data.backdropUrl }} accessibilityLabel={`${data.title} backdrop`} style={styles.backdrop} />
      ) : (
        <LinearGradient
          colors={[theme.colors.brandDeep, theme.colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.backdrop}
        />
      )}
      <Text style={[styles.title, { color: theme.colors.text }]}>{data.title}</Text>
      {data.koreanTitle ? (
        <Text style={[styles.korean, { color: theme.colors.textDim }]}>{data.koreanTitle}</Text>
      ) : null}
      <Text style={[styles.meta, { color: theme.colors.textDim }]}>
        {[...data.genres, data.status].join(' · ')} · {formatCount(data.followerCount)} followers ·{' '}
        {formatCount(data.watchingCount)} watching
      </Text>
      <Text style={[styles.synopsis, { color: theme.colors.textDim }]}>{data.synopsis}</Text>
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            title={data.viewerFollowing ? 'Following' : 'Follow'}
            variant={data.viewerFollowing ? 'secondary' : 'primary'}
            onPress={() => void handleFollow()}
            loading={follow.isPending}
          />
        </View>
        <View style={styles.action}>
          <Button
            title={watch ? `Watching · Ep ${watch.watchedThrough}` : 'Track'}
            variant="secondary"
            onPress={() => void handleTrack()}
            loading={tracking.isPending}
          />
        </View>
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
      <Text style={[styles.section, { color: theme.colors.text }]}>Cast</Text>
      {cast.isPending ? (
        <LoadingState label="Loading cast…" />
      ) : !cast.data || !cast.data.ok ? (
        <NotConfiguredState feature="Cast" onRetry={() => void cast.refetch()} />
      ) : cast.data.data.length === 0 ? (
        <EmptyState icon="people-outline" title="No cast listed" message="Cast information is not available yet." />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rail}>
          {cast.data.data.map((member) => (
            <View key={member.actorId} style={styles.railItem}>
              <ActorCard
                actorId={member.actorId}
                name={member.name}
                portraitUrl={member.portraitUrl}
                role={member.role}
              />
            </View>
          ))}
        </ScrollView>
      )}
      <Text style={[styles.section, { color: theme.colors.text }]}>Episodes</Text>
      {episodes.isPending ? (
        <LoadingState label="Loading episodes…" />
      ) : !episodes.data || !episodes.data.ok ? (
        <NotConfiguredState feature="Episodes" onRetry={() => void episodes.refetch()} />
      ) : episodes.data.data.length === 0 ? (
        <EmptyState icon="film-outline" title="No episodes yet" message="Episode information is not available yet." />
      ) : (
        <View style={styles.list}>
          {episodes.data.data.map((episode) => (
            <EpisodeRow
              key={episode.id}
              episode={episode}
              watched={watch !== null && watch.watchedThrough >= episode.number}
            />
          ))}
        </View>
      )}
      <Text style={[styles.section, { color: theme.colors.text }]}>Trending in this fandom</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rail}>
        {COMMUNITY_TABS.map((option) => (
          <View key={option.label} style={styles.railItem}>
            <Chip
              label={option.label}
              selected={tabLabel === option.label}
              onPress={() => setTabLabel(option.label)}
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.list}>
        {posts.isPending ? (
          <LoadingState label="Loading discussions…" />
        ) : posts.isError ? (
          <ErrorState message="Something went wrong." onRetry={() => void posts.refetch()} />
        ) : !posts.data?.pages[0]?.ok ? (
          <NotConfiguredState feature="Drama discussions" onRetry={() => void posts.refetch()} />
        ) : postItems.length === 0 ? (
          <EmptyState
            icon="chatbubbles-outline"
            title="No posts here yet"
            message="Start the first discussion for this drama."
          />
        ) : (
          postItems.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  korean: {
    fontSize: 15,
    marginTop: 2,
  },
  meta: {
    fontSize: 13,
    marginTop: 6,
  },
  synopsis: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  action: {
    flex: 1,
  },
  error: {
    fontSize: 14,
    marginTop: 8,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  rail: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  railItem: {
    marginRight: 8,
  },
  list: {
    gap: 12,
  },
});
