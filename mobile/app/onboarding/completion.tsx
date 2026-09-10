import { StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingShell } from '@/components/OnboardingShell';

// Onboarding · Completion (blueprint 20).
export default function OnboardingCompletion(): ReactNode {
  const theme = useTheme();
  const { completeOnboarding } = useAuth();
  return (
    <OnboardingShell
      step={5}
      title="Your wave is ready"
      continueTitle="Start exploring"
      onContinue={completeOnboarding}
    >
      <Text style={[styles.message, { color: theme.colors.textDim }]}>
        Your feed is personalized and your fandom awaits.
      </Text>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
});
