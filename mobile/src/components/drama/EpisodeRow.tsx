import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { formatCount } from '@/lib/format';
import type { EpisodeSummary } from '@/services/episodes';

interface EpisodeRowProps {
  episode: EpisodeSummary;
  watched: boolean;
}

export function EpisodeRow({ episode, watched }: EpisodeRowProps): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/drama/${episode.dramaId}/episode/${episode.number}`)}
      accessibilityRole="link"
      accessibilityLabel={`Episode ${episode.number}${episode.title ? `: ${episode.title}` : ''}`}
      style={[styles.row, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.number, { backgroundColor: theme.colors.surface2 }]}>
        <Text style={[styles.numberText, { color: theme.colors.text }]}>{episode.number}</Text>
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {episode.title ?? `Episode ${episode.number}`}
        </Text>
        <Text style={[styles.sub, { color: theme.colors.textDim }]}>
          {episode.airDate ?? 'Air date TBA'} · {formatCount(episode.discussionCount)} in discussion
        </Text>
      </View>
      {watched ? (
        <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} accessibilityLabel="Watched" />
      ) : null}
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
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
  number: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: '800',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  sub: {
    fontSize: 13,
  },
});
