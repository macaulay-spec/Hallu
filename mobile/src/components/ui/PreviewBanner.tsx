import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

// Shown on every tab screen while in preview mode so nobody mistakes
// navigation-only preview for real data.
export function PreviewBanner(): ReactNode {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: theme.colors.surface2 }]}
    >
      <Text style={[styles.text, { color: theme.colors.warning }]}>
        Preview mode — backend not linked. Navigation only, no data is real.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
