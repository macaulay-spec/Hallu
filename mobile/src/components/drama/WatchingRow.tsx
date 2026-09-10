import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import type { WatchingEntry } from '@/services/watching';
import { useSetWatchedThrough, useSetWatching } from '@/hooks/useWatching';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function WatchingRow({ entry }: { entry: WatchingEntry }): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const setThrough = useSetWatchedThrough(entry.dramaId);
  const setWatching = useSetWatching(entry.dramaId);
  const [error, setError] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const max = entry.episodeCount ?? Math.max(entry.watchedThrough + 1, 1);
  const progress = max > 0 ? Math.min(1, entry.watchedThrough / max) : 0;

  async function bump(delta: number): Promise<void> {
    const next = entry.watchedThrough + delta;
    if (next < 0 || (entry.episodeCount !== null && next > entry.episodeCount)) return;
    setError(null);
    const result = await setThrough.mutateAsync(next);
    if (!result.ok) setError(result.error.message);
  }

  async function handleRemove(): Promise<void> {
    setConfirmingRemove(false);
    setError(null);
    const result = await setWatching.mutateAsync(null);
    if (!result.ok) setError(result.error.message);
  }

  return (
    <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
      <Pressable
        onPress={() => router.push(`/drama/${entry.dramaId}`)}
        accessibilityRole="link"
        accessibilityLabel={entry.title}
        style={styles.main}
      >
        {entry.posterUrl ? (
          <Image source={{ uri: entry.posterUrl }} accessibilityLabel={`${entry.title} poster`} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.fallback, { backgroundColor: theme.colors.brandDeep }]}>
            <Text style={[styles.letter, { color: theme.colors.onBrand }]}>
              {entry.title.slice(0, 1)}
            </Text>
          </View>
        )}
        <View style={styles.text}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {entry.title}
          </Text>
          <Text style={[styles.sub, { color: theme.colors.textDim }]}>
            Ep {entry.watchedThrough}
            {entry.episodeCount !== null ? ` of ${entry.episodeCount}` : ''}
            {entry.status === 'completed' ? ' · Completed' : ''}
          </Text>
          <View style={[styles.bar, { backgroundColor: theme.colors.surface3 }]}>
            <View
              style={[styles.fill, { backgroundColor: theme.colors.brandBlue, flex: progress }]}
            />
            <View style={{ flex: 1 - progress }} />
          </View>
        </View>
      </Pressable>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => void bump(-1)}
          accessibilityRole="button"
          accessibilityLabel="One episode back"
          style={styles.step}
        >
          <Ionicons name="remove" size={18} color={theme.colors.text} />
        </Pressable>
        <Pressable
          onPress={() => void bump(1)}
          accessibilityRole="button"
          accessibilityLabel="Mark next episode watched"
          style={styles.step}
        >
          <Ionicons name="add" size={18} color={theme.colors.text} />
        </Pressable>
        <Pressable
          onPress={() => setConfirmingRemove(true)}
          accessibilityRole="button"
          accessibilityLabel="Stop tracking"
          style={styles.step}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        </Pressable>
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
      <ConfirmDialog
        visible={confirmingRemove}
        title="Stop tracking?"
        message={`Remove ${entry.title} from Currently Watching? Your progress is kept on the backend.`}
        confirmTitle="Remove"
        destructive
        onConfirm={() => void handleRemove()}
        onCancel={() => setConfirmingRemove(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 12,
    padding: 12,
  },
  main: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  poster: {
    width: 48,
    height: 72,
    borderRadius: 8,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontSize: 20,
    fontWeight: '800',
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  sub: {
    fontSize: 13,
  },
  bar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  fill: {
    borderRadius: 3,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  step: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: 13,
    marginTop: 4,
  },
});
