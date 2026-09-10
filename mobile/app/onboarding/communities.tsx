import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useCommunities } from '@/hooks/useCommunities';
import { OnboardingShell } from '@/components/OnboardingShell';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { CommunityCard } from '@/components/community/CommunityCard';

// Onboarding · Communities (blueprint 19). Official accounts join this step
// in Phase 5 when verification exists.
export default function OnboardingCommunities(): ReactNode {
  const router = useRouter();
  const suggestions = useCommunities({});
  const next = (): void => {
    router.push('/onboarding/completion');
  };

  const items = (suggestions.data?.pages ?? []).flatMap((page) =>
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
    </OnboardingShell>
  );
}
