import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/OnboardingShell';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';

// Onboarding · Actors (blueprint 18). Filled in by Phase 2/3.
export default function OnboardingActors(): ReactNode {
  const router = useRouter();
  const next = (): void => {
    router.push('/onboarding/communities');
  };
  return (
    <OnboardingShell step={3} title="Pick the actors you love" onContinue={next} onSkip={next}>
      <NotConfiguredState feature="Actor suggestions" />
    </OnboardingShell>
  );
}
