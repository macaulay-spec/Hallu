import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import type { ActorSummary } from '@/services/actors';
import { useActorFollowToggle, useActors } from '@/hooks/useActors';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';

function ActorFollowRow({ actor }: { actor: ActorSummary }): ReactNode {
  const theme = useTheme();
  const toggle = useActorFollowToggle(actor.id);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePress(): Promise<void> {
    setError(null);
    const result = await toggle.mutateAsync(following);
    if (result.ok) {
      setFollowing(result.data.following);
    } else {
      setError(result.error.message);
    }
  }

  return (
    <View style={styles.row}>
      <Avatar uri={actor.portraitUrl} name={actor.name} size={44} />
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {actor.name}
        </Text>
        {error ? (
          <Text accessibilityRole="alert" style={[styles.rowError, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}
      </View>
      <Button
        title={following ? 'Following' : 'Follow'}
        variant={following ? 'secondary' : 'primary'}
        onPress={() => void handlePress()}
        loading={toggle.isPending}
      />
    </View>
  );
}

// Onboarding · Actors (blueprint 18).
export default function OnboardingActors(): ReactNode {
  const router = useRouter();
  const suggestions = useActors();
  const next = (): void => {
    router.push('/onboarding/communities');
  };

  const items = (suggestions.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <OnboardingShell step={3} title="Pick the actors you love" onContinue={next} onSkip={next}>
      {suggestions.isPending ? (
        <LoadingState label="Loading suggestions…" />
      ) : suggestions.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void suggestions.refetch()} />
      ) : !suggestions.data?.pages[0]?.ok ? (
        <NotConfiguredState feature="Actor suggestions" onRetry={() => void suggestions.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon="people-outline" title="No suggestions" message="Continue to the next step." />
      ) : (
        items.slice(0, 6).map((actor) => <ActorFollowRow key={actor.id} actor={actor} />)
      )}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowError: {
    fontSize: 12,
    marginTop: 2,
  },
});
