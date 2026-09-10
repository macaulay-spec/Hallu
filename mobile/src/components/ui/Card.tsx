import { Pressable, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function Card({ children, onPress, accessibilityLabel }: CardProps): ReactNode {
  const theme = useTheme();
  const style = [
    styles.card,
    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
  ];
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={style}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
});
