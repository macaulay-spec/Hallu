import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { formatCount } from '@/lib/format';
import { useActor, useActorFilmography, useActorFollowToggle } from '@/hooks/useActors';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { DramaCard } from '@/components/drama/DramaCard';

// Actor Page (blueprint 21).
export default function ActorPage(): ReactNode {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const actor = useActor(id);
  const filmography = useActorFilmography(id);
  const follow = useActorFollowToggle(id);
  const [error, setError] = useState<string | null>(null);

  const data = actor.data && actor.data.ok ? actor.data.data : null;
  const credits = filmography.data && filmography.data.ok ? filmography.data.data : null;

  async function handleFollow(): Promise<void> {
    if (!data) return;
    setError(null);
    const result = await follow.mutateAsync(data.viewerFollowing);
    if (!result.ok) setError(result.error.message);
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Actor" />
      {actor.isPending ? (
        <LoadingState label="Loading actor…" />
      ) : actor.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void actor.refetch()} />
      ) : !data ? (
        <NotConfiguredState feature="Actor page" onRetry={() => void actor.refetch()} />
      ) : (
        <View style={styles.wrap}>
          <View style={styles.hero}>
            <Avatar uri={data.portraitUrl} name={data.name} size={96} />
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{data.name}</Text>
              {data.verified ? (
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.brandBlue} accessibilityLabel="Verified" />
              ) : null}
            </View>
            <Text style={[styles.meta, { color: theme.colors.textDim }]}>
              Actor · {formatCount(data.followerCount)} followers
            </Text>
            {data.bio.length > 0 ? (
              <Text style={[styles.bio, { color: theme.colors.textDim }]}>{data.bio}</Text>
            ) : null}
            <Button
              title={data.viewerFollowing ? 'Following' : 'Follow'}
              variant={data.viewerFollowing ? 'secondary' : 'primary'}
              onPress={() => void handleFollow()}
              loading={follow.isPending}
            />
            {error ? (
              <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
                {error}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.section, { color: theme.colors.text }]}>Known For</Text>
          {filmography.isPending ? (
            <LoadingState label="Loading credits…" />
          ) : !credits ? (
            <NotConfiguredState feature="Filmography" onRetry={() => void filmography.refetch()} />
          ) : credits.length === 0 ? (
            <EmptyState icon="film-outline" title="No credits yet" message="Filmography is not available yet." />
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rail}>
                {credits.slice(0, 3).map((credit) => (
                  <View key={credit.dramaId} style={styles.railItem}>
                    <DramaCard
                      drama={{
                        id: credit.dramaId,
                        title: credit.title,
                        koreanTitle: null,
                        posterUrl: credit.posterUrl,
                        status: 'completed',
                        year: credit.year,
                      }}
                    />
                  </View>
                ))}
              </ScrollView>
              <Text style={[styles.section, { color: theme.colors.text }]}>Filmography</Text>
              <View style={styles.list}>
                {credits.map((credit) => (
                  <View key={credit.dramaId} style={styles.credit}>
                    <DramaCard
                      drama={{
                        id: credit.dramaId,
                        title: credit.title,
                        koreanTitle: credit.role,
                        posterUrl: credit.posterUrl,
                        status: 'completed',
                        year: credit.year,
                      }}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
  },
  meta: {
    fontSize: 14,
  },
  bio: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginVertical: 8,
  },
  error: {
    fontSize: 14,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
  },
  rail: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  railItem: {
    width: 240,
    marginRight: 8,
  },
  list: {
    gap: 8,
  },
  credit: {
    marginBottom: 4,
  },
});
