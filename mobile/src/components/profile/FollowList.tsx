import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useFollowList } from '@/hooks/useFollows';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { UserRow } from '@/components/UserRow';
import { ScreenHeader } from '@/components/ScreenHeader';

interface FollowListProps {
  username: string;
  mode: 'followers' | 'following';
  title: string;
}

// Followers / Following lists (blueprints 24/27). Search filters loaded
// rows; server-side people search ships with Phase 3.
export function FollowList({ username, mode, title }: FollowListProps): ReactNode {
  const theme = useTheme();
  const query = useFollowList(username, mode);
  const [search, setSearch] = useState('');

  const firstPage = query.data?.pages[0];
  const rows = (query.data?.pages ?? [])
    .flatMap((page) => (page.ok ? page.data.items : []))
    .filter((row) => {
      const q = search.trim().toLowerCase();
      if (q.length === 0) return true;
      return (
        row.username.toLowerCase().includes(q) ||
        row.displayName.toLowerCase().includes(q)
      );
    });

  return (
    <Screen>
      <ScreenHeader title={title} />
      <TextField
        label="Search people"
        value={search}
        onChangeText={setSearch}
        placeholder="Search people"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.list}>
        {query.isPending ? (
          <LoadingState label="Loading…" />
        ) : query.isError ? (
          <ErrorState
            message="Something went wrong."
            onRetry={() => void query.refetch()}
          />
        ) : firstPage && !firstPage.ok ? (
          <NotConfiguredState
            feature={mode === 'followers' ? 'Followers' : 'Following list'}
            onRetry={() => void query.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="Nobody here yet"
            message={
              search.trim().length > 0
                ? 'No matching people in the loaded list.'
                : 'Follow people to grow this list.'
            }
          />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(row) => row.username}
            renderItem={({ item }) => <UserRow row={item} />}
            style={{ backgroundColor: theme.colors.background }}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    marginTop: 12,
  },
});
