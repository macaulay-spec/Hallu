import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useCommunities } from '@/hooks/useCommunities';
import { useOfficialAccounts } from '@/hooks/useVerification';
import { OnboardingShell } from '@/components/OnboardingShell';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { CommunityCard } from '@/components/community/CommunityCard';
import { UserRow } from '@/components/UserRow';

// Onboarding · Communities + official accounts (blueprint 19).
export default function OnboardingCommunities(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const suggestions = useCommunities({});
  const official = useOfficialAccounts();
  const next = (): void => {
    router.push('/onboarding/completion');
  };

  const items = (suggestions.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );
  const accounts = (official.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <OnboardingShell step={4} title="Join your communities" onContinue={next} onSkip={next}>
      {suggestions.isPending ? (
        <LoadingState label="Loading suggestions…" />
      ) : suggestions.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void suggestions.refetch()} />
      ) : !suggestions.data?.pages[0]?.ok ? (
        <NotConfiguredState feature="Community suggestions" onRetry={() => void suggestions.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No suggestions"
          message="Continue to the next step."
        />
      ) : (
        items
          .slice(0, 5)
          .map((community) => <CommunityCard key={community.id} community={community} />)
      )}
      <Text style={[styles.section, { color: theme.colors.text }]}>Official accounts</Text>
      {official.isPending ? (
        <LoadingState label="Loading official accounts…" />
      ) : official.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void official.refetch()} />
      ) : !official.data?.pages[0]?.ok ? (
        <NotConfiguredState feature="Official accounts" onRetry={() => void official.refetch()} />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon="checkmark-circle-outline"
          title="No official accounts"
          message="Studios and stars appear here once verified."
        />
      ) : (
        <View style={styles.accounts}>
          {accounts.slice(0, 5).map((account) => (
            <UserRow key={account.username} row={{ ...account, bio: '', following: false }} />
          ))}
        </View>
      )}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  accounts: {
    gap: 4,
  },
});
