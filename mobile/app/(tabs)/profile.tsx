import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOwnProfile } from '@/hooks/useProfile';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PreviewBanner } from '@/components/ui/PreviewBanner';
import { UserProfile } from '@/components/profile/UserProfile';

// Own profile tab: resolves the viewer, then renders the full profile.
export default function Profile(): ReactNode {
  const { previewMode, exitPreviewMode } = useAuth();
  const own = useOwnProfile();

  if (own.isPending) return <LoadingState label="Loading profile…" />;
  if (own.isError) {
    return (
      <Screen>
        {previewMode ? <PreviewBanner /> : null}
        <ErrorState
          message="Something went wrong loading your profile."
          onRetry={() => void own.refetch()}
        />
      </Screen>
    );
  }
  if (!own.data || !own.data.ok) {
    return (
      <Screen>
        {previewMode ? <PreviewBanner /> : null}
        <NotConfiguredState feature="Your profile" onRetry={() => void own.refetch()} />
        {previewMode ? (
          <Button title="Exit preview" variant="secondary" onPress={exitPreviewMode} />
        ) : null}
      </Screen>
    );
  }
  return <UserProfile username={own.data.data.username} isOwn />;
}
