import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { ONBOARDING_STEPS } from '@/lib/constants';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';

interface OnboardingShellProps {
  step: number;
  title: string;
  children: ReactNode;
  onContinue: () => void;
  continueTitle?: string;
  onSkip?: () => void;
}

export function OnboardingShell({
  step,
  title,
  children,
  onContinue,
  continueTitle = 'Continue',
  onSkip,
}: OnboardingShellProps): ReactNode {
  const theme = useTheme();
  return (
    <Screen scroll>
      <View style={styles.dots} accessibilityLabel={`Step ${step} of ${ONBOARDING_STEPS}`}>
        {Array.from({ length: ONBOARDING_STEPS }, (_, i) => i + 1).map((n) => (
          <View
            key={n}
            style={[
              styles.dot,
              {
                backgroundColor:
                  n <= step ? theme.colors.brandBlue : theme.colors.surface3,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.body}>{children}</View>
      <View style={styles.cta}>
        <Button title={continueTitle} onPress={onContinue} />
        {onSkip ? <Button title="Skip for now" variant="ghost" onPress={onSkip} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  body: {
    flex: 1,
    gap: 12,
    marginBottom: 16,
  },
  cta: {
    gap: 4,
  },
});
