import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { formatCount } from '@/lib/format';
import type { CommunitySummary } from '@/services/communities';
import { useJoinCommunity, useRequestJoin } from '@/hooks/useCommunities';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';

export function CommunityCard({ community }: { community: CommunitySummary }): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const join = useJoinCommunity(community.id);
  const request = useRequestJoin(community.id);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);

  async function handleJoin(): Promise<void> {
    setError(null);
    if (community.visibility === 'private') {
      const result = await request.mutateAsync();
      if (result.ok) {
        setRequested(true);
      } else {
        setError(result.error.message);
      }
      return;
    }
    const result = await join.mutateAsync();
    if (!result.ok) setError(result.error.message);
  }

  return (
    <Pressable
      onPress={() => router.push(`/community/${community.id}`)}
      accessibilityRole="link"
      accessibilityLabel={community.name}
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
    >
      <Avatar uri={community.avatarUrl} name={community.name} size={52} />
      <View style={styles.text}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {community.name}
          </Text>
          {community.visibility === 'private' ? (
            <Ionicons name="lock-closed" size={14} color={theme.colors.textMuted} accessibilityLabel="Private" />
          ) : null}
        </View>
        <Text style={[styles.desc, { color: theme.colors.textDim }]} numberOfLines={2}>
          {community.description}
        </Text>
        <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
          {formatCount(community.memberCount)} members
        </Text>
        {error ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}
      </View>
      <View style={styles.side}>
        {community.viewerRole ? (
          <Chip label={community.viewerRole === 'member' ? 'Joined' : community.viewerRole} />
        ) : requested ? (
          <Chip label="Requested" />
        ) : (
          <Button
            title={community.visibility === 'private' ? 'Request' : 'Join'}
            onPress={() => void handleJoin()}
            loading={join.isPending || request.isPending}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  desc: {
    fontSize: 13,
  },
  meta: {
    fontSize: 12,
  },
  error: {
    fontSize: 12,
  },
  side: {
    justifyContent: 'center',
  },
});
