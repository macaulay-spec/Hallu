import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import type { CommunityMember } from '@/services/communities';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

interface MemberRowProps {
  member: CommunityMember;
  showRoleActions: boolean;
  showBanAction: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onBan: () => void;
  busy: boolean;
}

export function MemberRow({
  member,
  showRoleActions,
  showBanAction,
  onPromote,
  onDemote,
  onBan,
  busy,
}: MemberRowProps): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push(`/user/${member.username}`)}
        accessibilityRole="link"
        accessibilityLabel={`View ${member.username}`}
        style={styles.identity}
      >
        <Avatar uri={member.avatarUrl} name={member.displayName} size={44} />
        <View style={styles.text}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {member.displayName}
          </Text>
          <Text style={[styles.role, { color: theme.colors.textMuted }]}>
            @{member.username} · {member.role}
          </Text>
        </View>
      </Pressable>
      {member.role === 'owner' ? null : (
        <View style={styles.actions}>
          {showRoleActions ? (
            member.role === 'moderator' ? (
              <Button title="Demote" variant="secondary" onPress={onDemote} disabled={busy} />
            ) : (
              <Button title="Make mod" variant="secondary" onPress={onPromote} disabled={busy} />
            )
          ) : null}
          {showBanAction ? (
            <Button title="Ban" variant="danger" onPress={onBan} disabled={busy} />
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 8,
  },
  identity: {
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
  role: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 56,
  },
});
