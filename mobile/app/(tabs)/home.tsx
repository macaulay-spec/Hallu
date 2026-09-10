import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useNotConfigured } from '@/hooks/useBackendQuery';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PreviewBanner } from '@/components/ui/PreviewBanner';

// Home · For You / Following (blueprints 06/07). Feed data arrives in
// Phase 3; until then the honest notConfigured state is shown.
export default function Home(): ReactNode {
  const theme = useTheme();
  const { previewMode } = useAuth();
  const [feed, setFeed] = useState('For You');
  const query = useNotConfigured('Home feed');

  return (
    <Screen>
      {previewMode ? <PreviewBanner /> : null}
      <Text style={[styles.header, { color: theme.colors.text }]}>Hallyu</Text>
      <SegmentedControl
        options={['For You', 'Following']}
        value={feed}
        onChange={setFeed}
        accessibilityLabel="Feed selector"
      />
      <View style={styles.feed}>
        {query.isPending ? (
          <LoadingState label="Loading your feed…" />
        ) : query.isError ? (
          <ErrorState
            message="Something went wrong loading your feed."
            onRetry={() => void query.refetch()}
          />
        ) : (
          <NotConfiguredState
            feature={feed === 'For You' ? 'For You feed' : 'Following feed'}
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
  feed: {
    flex: 1,
    marginTop: 12,
  },
});
