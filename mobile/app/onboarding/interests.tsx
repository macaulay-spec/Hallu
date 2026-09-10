import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { GENRES } from '@/lib/constants';
import type { Genre } from '@/lib/constants';
import { useSaveInterests } from '@/hooks/useOnboarding';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';

// Onboarding · Interests (blueprint 04). Selections save to the backend;
// without one the error is shown and continuing stays possible.
export default function OnboardingInterests(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const save = useSaveInterests();
  const [selected, setSelected] = useState<Genre[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggle(genre: Genre): void {
    setSelected((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]));
  }

  function next(): void {
    router.push('/onboarding/dramas');
  }

  async function handleContinue(): Promise<void> {
    setError(null);
    const result = await save.mutateAsync([...selected]);
    if (result.ok) {
      next();
    } else {
      setError(result.error.message);
    }
  }

  return (
    <OnboardingShell step={1} title="What are you into?" onContinue={() => void handleContinue()}>
      <View style={styles.grid}>
        {GENRES.map((genre) => (
          <Chip
            key={genre}
            label={genre}
            selected={selected.includes(genre)}
            onPress={() => toggle(genre)}
          />
        ))}
      </View>
      {error ? (
        <View style={styles.errorBox}>
          <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
          <Button title="Continue without saving" variant="secondary" onPress={next} />
        </View>
      ) : null}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  errorBox: {
    gap: 8,
  },
  error: {
    fontSize: 14,
  },
});
