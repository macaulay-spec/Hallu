import { Image, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
}

function initials(name: string): string {
  const cleaned = name.replace(/^@/, '').trim();
  if (cleaned.length === 0) return '?';
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return cleaned.slice(0, 2).toUpperCase();
  return `${parts[0]?.slice(0, 1) ?? ''}${parts[1]?.slice(0, 1) ?? ''}`.toUpperCase();
}

export function Avatar({ uri, name, size = 40 }: AvatarProps): ReactNode {
  const theme = useTheme();
  if (uri) {
    return (
      <Image
        source={{ uri }}
        accessibilityLabel={`${name} avatar`}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }
  return (
    <View
      accessibilityLabel={`${name} avatar`}
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.brandDeep,
        },
      ]}
    >
      <Text style={[styles.initials, { color: theme.colors.onBrand, fontSize: size * 0.4 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#262626',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
  },
});
