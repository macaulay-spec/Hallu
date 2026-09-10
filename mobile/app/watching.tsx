import { FlatList, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useWatching } from '@/hooks/useWatching';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { WatchingRow } from '@/components/drama/WatchingRow';

// Currently Watching (blueprint 28).
export default function Watching(): ReactNode {
  const router = useRouter();
  const query = useWatching();
  const entries = query.data && query.data.ok ? query.data.data : null;

  return (
    <Screen>
      <ScreenHeader title="Currently Watching" />
      <View style={styles.list}>
        {query.isPending ? (
          <LoadingState label="Loading tracked dramas…" />
        ) : query.isError ? (
          <ErrorState message="Something went wrong." onRetry={() => void query.refetch()} />
        ) : !entries ? (
          <NotConfiguredState feature="Currently watching" onRetry={() => void query.refetch()} />
        ) : entries.length === 0 ? (
          <EmptyState
            icon="tv-outline"
            title="No dramas tracked yet"
            message="Track a drama to follow episodes and join safe discussions."
          />
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(entry) => entry.dramaId}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <WatchingRow entry={item} />
              </View>
            )}
          />
        )}
      </View>
      <Button title="Add a new drama to track" variant="secondary" onPress={() => router.push('/dramas')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    marginBottom: 12,
  },
  row: {
    marginBottom: 12,
  },
});
