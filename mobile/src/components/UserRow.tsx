import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import type { FollowRow } from '@/services/follows';
import { Avatar } from '@/components/ui/Avatar';
import { FollowButton } from '@/components/FollowButton';

export function UserRow({ row }: { row: FollowRow }): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push(`/user/${row.username}`)}
        accessibilityRole="link"
        accessibilityLabel={`View ${row.username}`}
        style={styles.identity}
      >
        <Avatar uri={row.avatarUrl} name={row.displayName} size={44} />
        <View style={styles.text}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {row.displayName}
          </Text>
          <Text style={[styles.handle, { color: theme.colors.textMuted }]} numberOfLines={1}>
            @{row.username}
          </Text>
          {row.bio.length > 0 ? (
            <Text style={[styles.bio, { color: theme.colors.textDim }]} numberOfLines={1}>
              {row.bio}
            </Text>
          ) : null}
        </View>
      </Pressable>
      <FollowButton username={row.username} following={row.following} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  handle: {
    fontSize: 13,
  },
  bio: {
    fontSize: 13,
    marginTop: 2,
  },
});
