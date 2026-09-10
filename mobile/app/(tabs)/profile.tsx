import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useNotConfigured } from '@/hooks/useBackendQuery';
import { Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PreviewBanner } from '@/components/ui/PreviewBanner';

// Profile (blueprint 11). Real profile data arrives in Phase 1.
export default function Profile(): ReactNode {
  const theme = useTheme();
  const { previewMode, session, signOut, exitPreviewMode } = useAuth();
  const query = useNotConfigured('Profile');

  return (
    <Screen scroll>
      {previewMode ? <PreviewBanner /> : null}
      <LinearGradient
        colors={[theme.colors.brandDeep, theme.colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.cover}
      >
        <Avatar name={session?.email ?? 'Preview'} size={72} />
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {session?.email ?? 'Preview mode'}
        </Text>
        <Text style={[styles.bio, { color: theme.colors.textDim }]}>
          {session ? 'Backend not linked — profile unavailable.' : 'No account — navigation preview only.'}
        </Text>
      </LinearGradient>
      <View style={styles.body}>
        {query.isPending ? (
          <LoadingState label="Loading profile…" />
        ) : query.isError ? (
          <ErrorState
            message="Something went wrong loading this profile."
            onRetry={() => void query.refetch()}
          />
        ) : (
          <NotConfiguredState feature="Profile" onRetry={() => void query.refetch()} />
        )}
      </View>
      <Button
        title={previewMode ? 'Exit preview' : 'Sign out'}
        variant="secondary"
        onPress={() => void (previewMode ? exitPreviewMode() : signOut())}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
  },
  body: {
    minHeight: 240,
    marginBottom: 12,
  },
});
