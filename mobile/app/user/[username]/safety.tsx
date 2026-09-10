import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import type { ReportReason } from '@/services/reports';
import { useBlockToggle, useMuteToggle, useSubmitReport } from '@/hooks/useSafety';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ReportDialog } from '@/components/ReportDialog';

// Per-user safety actions: block, mute, report.
export default function UserSafety(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const block = useBlockToggle(username);
  const mute = useMuteToggle(username);
  const report = useSubmitReport();
  const [blocked, setBlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  async function handleBlock(): Promise<void> {
    setConfirmBlock(false);
    setError(null);
    const result = await block.mutateAsync(blocked);
    if (result.ok) {
      setBlocked(!blocked);
    } else {
      setError(result.error.message);
    }
  }

  async function handleMute(): Promise<void> {
    setError(null);
    const result = await mute.mutateAsync(muted);
    if (result.ok) {
      setMuted(!muted);
    } else {
      setError(result.error.message);
    }
  }

  async function handleReport(reason: ReportReason, details: string): Promise<void> {
    setError(null);
    const result = await report.mutateAsync({
      targetType: 'user',
      targetId: username,
      reason,
      details: details.length > 0 ? details : undefined,
    });
    if (result.ok) {
      setReportOpen(false);
      setReported(true);
    } else {
      setError(result.error.message);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Safety" />
      <Text style={[styles.subtitle, { color: theme.colors.textDim }]}>
        Safety options for @{username}
      </Text>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
      {reported ? (
        <Card>
          <Text style={[styles.reported, { color: theme.colors.text }]}>
            Report received. Our trust team will review it.
          </Text>
          <Button title="Back to profile" variant="secondary" onPress={() => router.back()} />
        </Card>
      ) : (
        <View style={styles.actions}>
          <Card>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              {blocked ? 'Unblock' : 'Block'} @{username}
            </Text>
            <Text style={[styles.actionDesc, { color: theme.colors.textDim }]}>
              Blocking hides you from each other completely.
            </Text>
            <Button
              title={blocked ? 'Unblock' : 'Block'}
              variant="danger"
              onPress={() => (blocked ? void handleBlock() : setConfirmBlock(true))}
              loading={block.isPending}
            />
          </Card>
          <Card>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              {muted ? 'Unmute' : 'Mute'} @{username}
            </Text>
            <Text style={[styles.actionDesc, { color: theme.colors.textDim }]}>
              Muting hides them from you. They are never told.
            </Text>
            <Button
              title={muted ? 'Unmute' : 'Mute'}
              variant="secondary"
              onPress={() => void handleMute()}
              loading={mute.isPending}
            />
          </Card>
          <Card>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Report @{username}</Text>
            <Text style={[styles.actionDesc, { color: theme.colors.textDim }]}>
              Tell the trust team about spam, harassment, or abuse.
            </Text>
            <Button title="Report" variant="secondary" onPress={() => setReportOpen(true)} />
          </Card>
        </View>
      )}
      <ConfirmDialog
        visible={confirmBlock}
        title={`Block @${username}?`}
        message="You will not see each other anywhere in the app."
        confirmTitle="Block"
        destructive
        onConfirm={() => void handleBlock()}
        onCancel={() => setConfirmBlock(false)}
      />
      <ReportDialog
        visible={reportOpen}
        targetLabel={`@${username}`}
        busy={report.isPending}
        onSubmit={(reason, details) => void handleReport(reason, details)}
        onClose={() => setReportOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  error: {
    fontSize: 14,
    marginBottom: 8,
  },
  actions: {
    gap: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 14,
    marginBottom: 12,
  },
  reported: {
    fontSize: 15,
    marginBottom: 12,
  },
});
