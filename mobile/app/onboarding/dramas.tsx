import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/OnboardingShell';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';

// Onboarding · Follows (blueprint 05). Drama suggestions need the backend;
// Phase 2/3 fills this in. Skipping is honest and allowed.
export default function OnboardingDramas(): ReactNode {
  const router = useRouter();
  const next = (): void => {
    router.push('/onboarding/actors');
  };
  return (
    <OnboardingShell step={2} title="Follow your world" onContinue={next} onSkip={next}>
      <NotConfiguredState feature="Drama suggestions" />
    </OnboardingShell>
  );
}
