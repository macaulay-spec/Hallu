import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import type { DramaSummary } from '@/services/dramas';
import { useDramas, useDramaFollowToggle } from '@/hooks/useDramas';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';

function DramaFollowRow({ drama }: { drama: DramaSummary }): ReactNode {
  const theme = useTheme();
  const toggle = useDramaFollowToggle(drama.id);
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
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {drama.title}
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

// Onboarding · Follows (blueprint 05).
export default function OnboardingDramas(): ReactNode {
  const router = useRouter();
  const suggestions = useDramas({});
  const next = (): void => {
    router.push('/onboarding/actors');
  };

  const items = (suggestions.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <OnboardingShell step={2} title="Follow your world" onContinue={next} onSkip={next}>
      {suggestions.isPending ? (
        <LoadingState label="Loading suggestions…" />
      ) : suggestions.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void suggestions.refetch()} />
      ) : !suggestions.data?.pages[0]?.ok ? (
        <NotConfiguredState feature="Drama suggestions" onRetry={() => void suggestions.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon="film-outline" title="No suggestions" message="Continue to the next step." />
      ) : (
        items.slice(0, 6).map((drama) => <DramaFollowRow key={drama.id} drama={drama} />)
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
