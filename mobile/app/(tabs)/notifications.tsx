import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import type { NotificationItem } from '@/services/notifications';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/useNotifications';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { NotificationRow } from '@/components/NotificationRow';

// Activity (blueprint 13).
export default function Notifications(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const feed = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [error, setError] = useState<string | null>(null);

  const firstPage = feed.data?.pages[0];
  const items = (feed.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );
  const hasUnread = items.some((item) => !item.read);

  function destination(item: NotificationItem): string | null {
    if (item.postId) return `/post/${item.postId}`;
    if (item.communityId) return `/community/${item.communityId}`;
    if (item.kind === 'follow' && item.actor) return `/user/${item.actor.username}`;
    return null;
  }

  async function handlePress(item: NotificationItem): Promise<void> {
    if (!item.read) {
      const result = await markRead.mutateAsync(item.id);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
    }
    const target = destination(item);
    if (target) router.push(target as '/post/[id]');
  }

  async function handleMarkAll(): Promise<void> {
    setError(null);
    const result = await markAll.mutateAsync();
    if (!result.ok) setError(result.error.message);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Activity</Text>
        {hasUnread ? (
          <Button title="Mark all read" variant="secondary" onPress={() => void handleMarkAll()} />
        ) : null}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
      <View style={styles.list}>
        {feed.isPending ? (
          <LoadingState label="Loading activity…" />
        ) : feed.isError ? (
          <ErrorState message="Something went wrong." onRetry={() => void feed.refetch()} />
        ) : firstPage && !firstPage.ok ? (
          <NotConfiguredState feature="Notifications" onRetry={() => void feed.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title="All quiet"
            message="Reactions, replies, and follows land here."
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <NotificationRow item={item} onPress={() => void handlePress(item)} />
              </View>
            )}
            onEndReached={() => {
              if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  error: {
    fontSize: 14,
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  row: {
    marginBottom: 4,
  },
});
