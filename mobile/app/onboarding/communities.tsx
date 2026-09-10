import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/OnboardingShell';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';

// Onboarding · Communities (blueprint 19). Filled in by Phase 3/4.
export default function OnboardingCommunities(): ReactNode {
  const router = useRouter();
  const next = (): void => {
    router.push('/onboarding/completion');
  };
  return (
    <OnboardingShell step={4} title="Join communities" onContinue={next} onSkip={next}>
      <NotConfiguredState feature="Community suggestions" />
    </OnboardingShell>
  );
}
