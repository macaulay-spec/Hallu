import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import type { DramaSummary } from '@/services/dramas';

const STATUS_LABELS: Record<string, string> = {
  airing: 'Currently Airing',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

export function DramaCard({ drama }: { drama: DramaSummary }): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/drama/${drama.id}`)}
      accessibilityRole="link"
      accessibilityLabel={`${drama.title}, ${STATUS_LABELS[drama.status] ?? drama.status}`}
      style={[styles.row, { backgroundColor: theme.colors.surface }]}
    >
      {drama.posterUrl ? (
        <Image source={{ uri: drama.posterUrl }} accessibilityLabel={`${drama.title} poster`} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterFallback, { backgroundColor: theme.colors.brandDeep }]}>
          <Text style={[styles.posterLetter, { color: theme.colors.onBrand }]}>
            {drama.title.slice(0, 1)}
          </Text>
        </View>
      )}
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {drama.title}
        </Text>
        {drama.koreanTitle ? (
          <Text style={[styles.sub, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {drama.koreanTitle}
          </Text>
        ) : null}
        <Text style={[styles.sub, { color: theme.colors.textDim }]}>
          {[drama.year ? String(drama.year) : null, STATUS_LABELS[drama.status] ?? drama.status]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  poster: {
    width: 56,
    height: 84,
    borderRadius: 8,
  },
  posterFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterLetter: {
    fontSize: 24,
    fontWeight: '800',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    fontSize: 13,
  },
});
