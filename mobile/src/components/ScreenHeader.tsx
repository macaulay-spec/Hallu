import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';

interface ScreenHeaderProps {
  title: string;
}

// Consistent stack header: back chevron + centered title.
export function ScreenHeader({ title }: ScreenHeaderProps): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.back}
      >
        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
      </Pressable>
      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.back} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  back: {
    width: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
