import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { WaveMark } from '@/components/WaveMark';

// Splash / Brand (blueprint 01). Visible during auth restore, then the
// root gate redirects to welcome, onboarding, or home.
export default function Splash(): ReactNode {
  const theme = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.background }]}>
      <WaveMark size={88} />
      <Text style={[styles.wordmark, { color: theme.colors.text }]}>HALLYU</Text>
      <Text style={[styles.tagline, { color: theme.colors.textDim }]}>
        Where the Wave Lives
      </Text>
      <ActivityIndicator
        color={theme.colors.brandBlue}
        style={styles.spinner}
        accessibilityLabel="Loading"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 24,
  },
  wordmark: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 6,
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
  },
  spinner: {
    marginTop: 24,
  },
});
