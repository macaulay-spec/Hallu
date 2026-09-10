import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { canBan, canManageRoles, canReviewRequests } from '@/lib/community';
import {
  useBanToggle,
  useCommunity,
  useCommunityMembers,
  useResolveJoinRequest,
  useSetMemberRole,
} from '@/hooks/useCommunities';
import { useJoinRequests } from '@/hooks/useCommunities';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { MemberRow } from '@/components/community/MemberRow';

export default function CommunityMembers(): ReactNode {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const community = useCommunity(id);
  const members = useCommunityMembers(id);
  const roles = useSetMemberRole(id);
  const bans = useBanToggle(id);
  const resolve = useResolveJoinRequest(id);
  const [error, setError] = useState<string | null>(null);
  const [pendingBan, setPendingBan] = useState<string | null>(null);

  const data = community.data && community.data.ok ? community.data.data : null;
  const role = data?.viewerRole ?? null;
  const requests = useJoinRequests(id, canReviewRequests(role));
  const busy = roles.isPending || bans.isPending || resolve.isPending;

  const rows = (members.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );
  const pending = requests.data && requests.data.ok ? requests.data.data : [];

  async function handleRole(username: string, next: 'member' | 'moderator'): Promise<void> {
    setError(null);
    const result = await roles.mutateAsync({ username, role: next });
    if (!result.ok) setError(result.error.message);
  }

  async function handleBan(): Promise<void> {
    if (!pendingBan) return;
    const username = pendingBan;
    setPendingBan(null);
    setError(null);
    const result = await bans.mutateAsync({ username, banned: false });
    if (!result.ok) setError(result.error.message);
  }

  async function handleRequest(username: string, approve: boolean): Promise<void> {
    setError(null);
    const result = await resolve.mutateAsync({ username, approve });
    if (!result.ok) setError(result.error.message);
  }

  return (
    <Screen>
      <ScreenHeader title="Members" />
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
      {canReviewRequests(role) && pending.length > 0 ? (
        <View style={styles.requests}>
          <Text style={[styles.section, { color: theme.colors.text }]}>Join requests</Text>
          {pending.map((item) => (
            <View key={item.username} style={styles.request}>
              <Avatar uri={item.avatarUrl} name={item.displayName} size={40} />
              <Text style={[styles.requestName, { color: theme.colors.text }]}>
                {item.displayName}
              </Text>
              <Button
                title="Approve"
                variant="secondary"
                onPress={() => void handleRequest(item.username, true)}
                disabled={busy}
              />
              <Button
                title="Decline"
                variant="danger"
                onPress={() => void handleRequest(item.username, false)}
                disabled={busy}
              />
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.list}>
        {members.isPending ? (
          <LoadingState label="Loading members…" />
        ) : members.isError ? (
          <ErrorState message="Something went wrong." onRetry={() => void members.refetch()} />
        ) : !members.data?.pages[0]?.ok ? (
          <NotConfiguredState feature="Members" onRetry={() => void members.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon="people-outline" title="No members" message="Nobody here yet." />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(member) => member.username}
            renderItem={({ item }) => (
              <MemberRow
                member={item}
                showRoleActions={canManageRoles(role)}
                showBanAction={canBan(role)}
                onPromote={() => void handleRole(item.username, 'moderator')}
                onDemote={() => void handleRole(item.username, 'member')}
                onBan={() => setPendingBan(item.username)}
                busy={busy}
              />
            )}
            onEndReached={() => {
              if (members.hasNextPage && !members.isFetchingNextPage) void members.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
      <ConfirmDialog
        visible={pendingBan !== null}
        title="Ban member?"
        message={`${pendingBan ?? ''} will no longer see or access this community.`}
        confirmTitle="Ban"
        destructive
        onConfirm={() => void handleBan()}
        onCancel={() => setPendingBan(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: 14,
    marginBottom: 8,
  },
  requests: {
    gap: 8,
    marginBottom: 12,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
  },
  request: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
});
