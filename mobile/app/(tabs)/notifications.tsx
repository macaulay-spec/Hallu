import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useNotConfigured } from '@/hooks/useBackendQuery';
import { Screen } from '@/components/ui/Screen';
import { Chip } from '@/components/ui/Chip';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PreviewBanner } from '@/components/ui/PreviewBanner';

const FILTERS = ['All', 'Replies', 'Mentions', 'Episodes'];

// Notifications (blueprint 10). Real events arrive in Phase 5.
export default function Notifications(): ReactNode {
  const theme = useTheme();
  const { previewMode } = useAuth();
  const [filter, setFilter] = useState('All');
  const query = useNotConfigured('Notifications');

  return (
    <Screen>
      {previewMode ? <PreviewBanner /> : null}
      <Text style={[styles.header, { color: theme.colors.text }]}>Notifications</Text>
      <View style={styles.chips}>
        {FILTERS.map((name) => (
          <Chip key={name} label={name} selected={filter === name} onPress={() => setFilter(name)} />
        ))}
      </View>
      <View style={styles.body}>
        {query.isPending ? (
          <LoadingState label="Loading notifications…" />
        ) : query.isError ? (
          <ErrorState
            message="Something went wrong loading notifications."
            onRetry={() => void query.refetch()}
          />
        ) : (
          <NotConfiguredState
            feature="Notifications"
            onRetry={() => void query.refetch()}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  body: {
    flex: 1,
    marginTop: 12,
  },
});
