import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useCompleteOnboarding } from '@/hooks/useOnboarding';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Button } from '@/components/ui/Button';

// Onboarding · Completion (blueprint 20).
export default function OnboardingCompletion(): ReactNode {
  const theme = useTheme();
  const { completeOnboarding } = useAuth();
  const server = useCompleteOnboarding();
  const [error, setError] = useState<string | null>(null);

  async function handleFinish(): Promise<void> {
    setError(null);
    const result = await server.mutateAsync();
    if (result.ok) {
      completeOnboarding();
    } else {
      setError(result.error.message);
    }
  }

  return (
    <OnboardingShell
      step={5}
      title="Your wave is ready"
      continueTitle="Start exploring"
      onContinue={() => void handleFinish()}
    >
      <Text style={[styles.message, { color: theme.colors.textDim }]}>
        Your feed is personalized and your fandom awaits.
      </Text>
      {error ? (
        <View style={styles.errorBox}>
          <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
          <Button title="Start exploring anyway" variant="secondary" onPress={completeOnboarding} />
        </View>
      ) : null}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
  errorBox: {
    gap: 8,
  },
  error: {
    fontSize: 14,
  },
});
