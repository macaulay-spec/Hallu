import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { isSpoilerHidden } from '@/lib/spoiler';
import type { SpoilerMode } from '@/lib/spoiler';
import { Button } from '@/components/ui/Button';

interface SpoilerGateProps {
  spoilerEpisode: number | null;
  watchedThrough?: number | null;
  mode?: SpoilerMode;
  children: ReactNode;
}

// Client-side spoiler UX: hides gated content until the viewer reveals it.
// Server RLS is the real enforcement; this is presentation + consent.
export function SpoilerGate({
  spoilerEpisode,
  watchedThrough = null,
  mode = 'on',
  children,
}: SpoilerGateProps): ReactNode {
  const theme = useTheme();
  const [revealed, setRevealed] = useState(false);

  if (!isSpoilerHidden(spoilerEpisode, watchedThrough, mode) || revealed) {
    return <>{children}</>;
  }

  return (
    <Pressable
      onPress={() => setRevealed(true)}
      accessibilityRole="button"
      accessibilityLabel={`Reveal spoiler for episode ${spoilerEpisode ?? ''}`}
      style={[styles.gate, { backgroundColor: theme.colors.surface2 }]}
    >
      <View>
        <Text style={[styles.badge, { color: theme.colors.accent }]}>SPOILER</Text>
        <Text style={[styles.hint, { color: theme.colors.textDim }]}>
          Hidden past your watched progress. Tap to reveal.
        </Text>
        <Button title="Reveal" variant="secondary" onPress={() => setRevealed(true)} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gate: {
    borderRadius: 12,
    padding: 16,
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    marginBottom: 12,
  },
});
