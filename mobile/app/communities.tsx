import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useCommunities } from '@/hooks/useCommunities';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { CommunityCard } from '@/components/community/CommunityCard';

// Community browse: discover or filter to joined communities.
export default function Communities(): ReactNode {
  const router = useRouter();
  const [scope, setScope] = useState('Discover');
  const [search, setSearch] = useState('');
  const query = useCommunities({
    query: search.trim().length > 0 ? search.trim() : undefined,
    joinedOnly: scope === 'Joined',
  });

  const firstPage = query.data?.pages[0];
  const items = (query.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <Screen>
      <ScreenHeader title="Communities" />
      <SegmentedControl
        options={['Discover', 'Joined']}
        value={scope}
        onChange={setScope}
        accessibilityLabel="Community scope"
      />
      <TextField
        label="Search communities"
        value={search}
        onChangeText={setSearch}
        placeholder="Romance, theories, memes…"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.list}>
        {query.isPending ? (
          <LoadingState label="Loading communities…" />
        ) : query.isError ? (
          <ErrorState message="Something went wrong." onRetry={() => void query.refetch()} />
        ) : firstPage && !firstPage.ok ? (
          <NotConfiguredState feature="Communities" onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No communities here"
            message={
              scope === 'Joined'
                ? 'Join a community to see it here.'
                : 'Try a different search, or start one.'
            }
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(community) => community.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <CommunityCard community={item} />
              </View>
            )}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
      <Button title="Create a community" onPress={() => router.push('/communities/create')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    marginTop: 12,
    marginBottom: 12,
  },
  card: {
    marginBottom: 8,
  },
});
