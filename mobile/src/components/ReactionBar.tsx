import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { formatCount } from '@/lib/format';
import { REACTION_KINDS } from '@/lib/constants';
import type { Post } from '@/services/posts';
import type { ReactionKind } from '@/services/reactions';
import { useSetPostReaction } from '@/hooks/useReactions';

const ICONS: Record<ReactionKind, ComponentProps<typeof Ionicons>['name']> = {
  like: 'heart-outline',
  love: 'heart',
  laugh: 'happy-outline',
  sad: 'sad-outline',
  angry: 'flame-outline',
};

export function ReactionBar({ post }: { post: Post }): ReactNode {
  const theme = useTheme();
  const mutation = useSetPostReaction(post.id);
  const [error, setError] = useState<string | null>(null);

  async function toggle(kind: ReactionKind): Promise<void> {
    setError(null);
    const next = post.viewerReaction === kind ? null : kind;
    const result = await mutation.mutateAsync(next);
    if (!result.ok) setError(result.error.message);
  }

  return (
    <View>
      <View style={styles.row} accessibilityRole="toolbar" accessibilityLabel="Reactions">
        {REACTION_KINDS.map((kind) => {
          const selected = post.viewerReaction === kind;
          return (
            <Pressable
              key={kind}
              onPress={() => void toggle(kind)}
              accessibilityRole="button"
              accessibilityLabel={`${kind}, ${post.reactionCounts[kind]} reactions`}
              accessibilityState={{ selected }}
              style={styles.reaction}
            >
              <Ionicons
                name={ICONS[kind]}
                size={20}
                color={selected ? theme.colors.accent : theme.colors.textMuted}
              />
              <Text style={[styles.count, { color: theme.colors.textDim }]}>
                {formatCount(post.reactionCounts[kind])}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 6,
  },
  count: {
    fontSize: 13,
  },
  error: {
    fontSize: 13,
    marginTop: 4,
  },
});
