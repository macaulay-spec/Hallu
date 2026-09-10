import { Pressable, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps): ReactNode {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      accessibilityState={onPress ? { selected } : undefined}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.brandBlue : theme.colors.surface2,
          borderColor: selected ? theme.colors.brandBlue : theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? theme.colors.onBrand : theme.colors.textDim },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
