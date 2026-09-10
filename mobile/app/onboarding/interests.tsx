import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { GENRES } from '@/lib/constants';
import type { Genre } from '@/lib/constants';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Chip } from '@/components/ui/Chip';

// Onboarding · Interests (blueprint 04). Genre taxonomy is static product
// config; selections persist to the backend in Phase 3.
export default function OnboardingInterests(): ReactNode {
  const router = useRouter();
  const [selected, setSelected] = useState<Genre[]>([]);

  function toggle(genre: Genre): void {
    setSelected((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]));
  }

  return (
    <OnboardingShell
      step={1}
      title="What are you into?"
      onContinue={() => router.push('/onboarding/dramas')}
    >
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
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
