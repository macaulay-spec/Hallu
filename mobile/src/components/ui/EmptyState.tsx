import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  message,
  actionTitle,
  onAction,
}: EmptyStateProps): ReactNode {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={40} color={theme.colors.textMuted} />
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.colors.textDim }]}>{message}</Text>
      {actionTitle && onAction ? (
        <Button title={actionTitle} variant="secondary" onPress={onAction} />
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
