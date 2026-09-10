import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import type { DramaStatus } from '@/services/dramas';
import { useDramas } from '@/hooks/useDramas';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { Chip } from '@/components/ui/Chip';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { DramaCard } from '@/components/drama/DramaCard';

interface StatusOption {
  label: string;
  value: DramaStatus | undefined;
}

const STATUS_OPTIONS: StatusOption[] = [
  { label: 'All', value: undefined },
  { label: 'Airing', value: 'airing' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
];

// Drama browse: status filter + title search.
export default function Dramas(): ReactNode {
  const [status, setStatus] = useState<DramaStatus | undefined>(undefined);
  const [search, setSearch] = useState('');
  const query = useDramas({ status, query: search.trim().length > 0 ? search.trim() : undefined });

  const firstPage = query.data?.pages[0];
  const items = (query.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <Screen>
      <ScreenHeader title="Dramas" />
      <TextField
        label="Search dramas"
        value={search}
        onChangeText={setSearch}
        placeholder="Search titles…"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.chips}>
        {STATUS_OPTIONS.map((option) => (
          <Chip
            key={option.label}
            label={option.label}
            selected={status === option.value}
            onPress={() => setStatus(option.value)}
          />
        ))}
      </View>
      <View style={styles.list}>
        {query.isPending ? (
          <LoadingState label="Loading dramas…" />
        ) : query.isError ? (
          <ErrorState message="Something went wrong." onRetry={() => void query.refetch()} />
        ) : firstPage && !firstPage.ok ? (
          <NotConfiguredState feature="Drama browse" onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="film-outline"
            title="No dramas found"
            message="Try a different search or filter."
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(drama) => drama.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <DramaCard drama={item} />
              </View>
            )}
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  card: {
    marginBottom: 8,
  },
});
