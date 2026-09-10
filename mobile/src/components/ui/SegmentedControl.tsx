import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps): ReactNode {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.row, { backgroundColor: theme.colors.surface2 }]}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="tab"
            accessibilityLabel={option}
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              selected && { backgroundColor: theme.colors.surface3 },
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: selected ? theme.colors.text : theme.colors.textMuted },
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
