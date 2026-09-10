import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useNotConfigured } from '@/hooks/useBackendQuery';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PreviewBanner } from '@/components/ui/PreviewBanner';

// Explore (blueprint 08). Discovery data arrives in Phase 3.
export default function Explore(): ReactNode {
  const theme = useTheme();
  const { previewMode } = useAuth();
  const [queryText, setQueryText] = useState('');
  const query = useNotConfigured('Explore');

  return (
    <Screen>
      {previewMode ? <PreviewBanner /> : null}
      <Text style={[styles.header, { color: theme.colors.text }]}>Explore</Text>
      <TextField
        label="Search"
        value={queryText}
        onChangeText={setQueryText}
        placeholder="Search dramas, stars, posts…"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.body}>
        {query.isPending ? (
          <LoadingState label="Loading explore…" />
        ) : query.isError ? (
          <ErrorState
            message="Something went wrong loading explore."
            onRetry={() => void query.refetch()}
          />
        ) : (
          <NotConfiguredState
            feature="Explore sections and search"
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
  body: {
    flex: 1,
    marginTop: 12,
  },
});
