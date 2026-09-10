import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { track } from '@/lib/analytics';
import { formatCount } from '@/lib/format';
import { canModerate } from '@/lib/community';
import type { ReportReason } from '@/services/reports';
import {
  useCommunity,
  useCommunityPosts,
  useJoinCommunity,
  useLeaveCommunity,
  usePinToggle,
  useRemoveCommunityPost,
  useRequestJoin,
} from '@/hooks/useCommunities';
import { useSubmitReport } from '@/hooks/useSafety';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ReportDialog } from '@/components/ReportDialog';
import { PostCard } from '@/components/PostCard';

// Community Page (blueprint 15).
export default function CommunityPage(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const community = useCommunity(id);
  const posts = useCommunityPosts(id);
  const join = useJoinCommunity(id);
  const request = useRequestJoin(id);
  const leave = useLeaveCommunity(id);
  const pin = usePinToggle(id);
  const remove = useRemoveCommunityPost(id);
  const report = useSubmitReport();
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const data = community.data && community.data.ok ? community.data.data : null;
  const items = (posts.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );
  const pinned = items.filter((item) => item.pinned);
  const mod = canModerate(data?.viewerRole ?? null);

  async function handleJoin(): Promise<void> {
    if (!data) return;
    setError(null);
    if (data.visibility === 'private') {
      const result = await request.mutateAsync();
      if (result.ok) {
        setRequested(true);
      } else {
        setError(result.error.message);
      }
      return;
    }
    const result = await join.mutateAsync();
    if (result.ok) {
      track('community_joined', { communityId: id });
    } else {
      setError(result.error.message);
    }
  }

  async function handleLeave(): Promise<void> {
    setConfirmLeave(false);
    setError(null);
    const result = await leave.mutateAsync();
    if (!result.ok) setError(result.error.message);
  }

  async function handlePin(postId: string, pinnedNow: boolean): Promise<void> {
    setError(null);
    const result = await pin.mutateAsync({ postId, pinned: !pinnedNow });
    if (!result.ok) setError(result.error.message);
  }

  async function handleRemove(): Promise<void> {
    if (!pendingRemove) return;
    const postId = pendingRemove;
    setPendingRemove(null);
    setError(null);
    const result = await remove.mutateAsync(postId);
    if (!result.ok) setError(result.error.message);
  }

  async function handleReport(reason: ReportReason, details: string): Promise<void> {
    setError(null);
    const result = await report.mutateAsync({
      targetType: 'community',
      targetId: id,
      reason,
      details: details.length > 0 ? details : undefined,
    });
    if (result.ok) {
      setReportOpen(false);
    } else {
      setError(result.error.message);
    }
  }

  if (community.isPending) {
    return (
      <Screen>
        <ScreenHeader title="Community" />
        <LoadingState label="Loading community…" />
      </Screen>
    );
  }
  if (community.isError) {
    return (
      <Screen>
        <ScreenHeader title="Community" />
        <ErrorState message="Something went wrong." onRetry={() => void community.refetch()} />
      </Screen>
    );
  }
  if (!data) {
    return (
      <Screen>
        <ScreenHeader title="Community" />
        <NotConfiguredState feature="Community" onRetry={() => void community.refetch()} />
      </Screen>
    );
  }

  const locked = data.visibility === 'private' && !data.viewerRole;

  return (
    <Screen scroll>
      <ScreenHeader title={data.name} />
      <LinearGradient
        colors={[theme.colors.brandDeep, theme.colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.banner}
      >
        <Avatar uri={data.avatarUrl} name={data.name} size={64} />
        <Text style={[styles.name, { color: theme.colors.text }]}>{data.name}</Text>
        <Text style={[styles.desc, { color: theme.colors.textDim }]}>{data.description}</Text>
        <View style={styles.stats}>
          <Pressable
            onPress={() => router.push(`/community/${id}/members`)}
            accessibilityRole="link"
            accessibilityLabel={`${data.memberCount} members`}
          >
            <Text style={[styles.stat, { color: theme.colors.textDim }]}>
              {formatCount(data.memberCount)} members
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/community/${id}/rules`)}
            accessibilityRole="link"
            accessibilityLabel={`${data.rulesCount} rules`}
          >
            <Text style={[styles.stat, { color: theme.colors.textDim }]}>
              {data.rulesCount} rules
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
      {data.viewerRole ? (
        data.viewerRole === 'owner' ? (
          <Text style={[styles.role, { color: theme.colors.textDim }]}>You own this community</Text>
        ) : (
          <Button title="Leave" variant="secondary" onPress={() => setConfirmLeave(true)} />
        )
      ) : requested ? (
        <Button title="Request sent" variant="secondary" disabled onPress={() => {}} />
      ) : (
        <Button
          title={data.visibility === 'private' ? 'Request to join' : 'Join'}
          onPress={() => void handleJoin()}
          loading={join.isPending || request.isPending}
        />
      )}
      <Button title="Report community" variant="ghost" onPress={() => setReportOpen(true)} />
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
      {locked ? (
        <EmptyState
          icon="lock-closed"
          title="This community is private"
          message="Join to see posts and members."
        />
      ) : (
        <View style={styles.feed}>
          {pinned.length > 0 ? (
            <View style={[styles.pinned, { backgroundColor: theme.colors.surface2 }]}>
              <Text style={[styles.pinnedLabel, { color: theme.colors.warning }]}>
                PIN · {pinned[0]?.post.text.slice(0, 80) ?? ''}
              </Text>
            </View>
          ) : null}
          {posts.isPending ? (
            <LoadingState label="Loading feed…" />
          ) : posts.isError ? (
            <ErrorState message="Something went wrong." onRetry={() => void posts.refetch()} />
          ) : !posts.data?.pages[0]?.ok ? (
            <NotConfiguredState feature="Community feed" onRetry={() => void posts.refetch()} />
          ) : items.length === 0 ? (
            <EmptyState
              icon="chatbubbles-outline"
              title="No posts yet"
              message="Start the first conversation."
            />
          ) : (
            items.map((item) => (
              <View key={item.post.id}>
                {item.pinned ? (
                  <Text style={[styles.pinBadge, { color: theme.colors.warning }]}>PINNED</Text>
                ) : null}
                <PostCard post={item.post} />
                {mod ? (
                  <View style={styles.modRow}>
                    <Button
                      title={item.pinned ? 'Unpin' : 'Pin'}
                      variant="secondary"
                      onPress={() => void handlePin(item.post.id, item.pinned)}
                    />
                    <Button
                      title="Remove"
                      variant="danger"
                      onPress={() => setPendingRemove(item.post.id)}
                    />
                  </View>
                ) : null}
              </View>
            ))
          )}
          {posts.hasNextPage ? (
            <Button
              title="Load more"
              variant="secondary"
              onPress={() => void posts.fetchNextPage()}
              loading={posts.isFetchingNextPage}
            />
          ) : null}
          {data.viewerRole ? (
            <Button
              title={`Post to ${data.name}…`}
              variant="secondary"
              onPress={() =>
                router.push(`/compose?communityId=${id}&communityName=${encodeURIComponent(data.name)}`)
              }
            />
          ) : null}
        </View>
      )}
      <ConfirmDialog
        visible={confirmLeave}
        title="Leave community?"
        message="You can rejoin later."
        confirmTitle="Leave"
        destructive
        onConfirm={() => void handleLeave()}
        onCancel={() => setConfirmLeave(false)}
      />
      <ConfirmDialog
        visible={pendingRemove !== null}
        title="Remove post?"
        message="This removes the post from the community."
        confirmTitle="Remove"
        destructive
        onConfirm={() => void handleRemove()}
        onCancel={() => setPendingRemove(null)}
      />
      <ReportDialog
        visible={reportOpen}
        targetLabel={data.name}
        busy={report.isPending}
        onSubmit={(reason, details) => void handleReport(reason, details)}
        onClose={() => setReportOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  stat: {
    fontSize: 13,
    fontWeight: '600',
  },
  role: {
    fontSize: 13,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    marginTop: 8,
  },
  feed: {
    gap: 12,
    marginTop: 12,
  },
  pinned: {
    borderRadius: 8,
    padding: 10,
  },
  pinnedLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  pinBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
