import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';

// The honest face of adapter-first: shown whenever a feature needs the
// backend and none is linked. Never renders fake content.
interface NotConfiguredStateProps {
  feature: string;
  onRetry?: () => void;
}

export function NotConfiguredState({ feature, onRetry }: NotConfiguredStateProps): ReactNode {
  const theme = useTheme();
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Ionicons name="server-outline" size={40} color={theme.colors.textMuted} />
      <Text style={[styles.title, { color: theme.colors.text }]}>Backend not linked</Text>
      <Text style={[styles.message, { color: theme.colors.textDim }]}>
        {feature} needs a linked backend, so there is nothing to show yet. No data was
        faked to fill this space.
      </Text>
      {onRetry ? (
        <Button title="Retry" variant="secondary" onPress={onRetry} />
      ) : null}
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
});
