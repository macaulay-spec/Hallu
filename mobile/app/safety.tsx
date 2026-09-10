import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useBlockToggle, useBlockedUsers, useMuteToggle, useMutedUsers, useMyReports } from '@/hooks/useSafety';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';

// Safety hub: blocked + muted accounts and your report history.
export default function Safety(): ReactNode {
  const theme = useTheme();
  const reports = useMyReports();
  const [error, setError] = useState<string | null>(null);

  const reportRows = (reports.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );

  return (
    <Screen scroll>
      <ScreenHeader title="Safety" />
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}

      <Text style={[styles.section, { color: theme.colors.text }]}>Blocked accounts</Text>
      <BlockedList onError={setError} />

      <Text style={[styles.section, { color: theme.colors.text }]}>Muted accounts</Text>
      <MutedList onError={setError} />

      <Text style={[styles.section, { color: theme.colors.text }]}>My reports</Text>
      {reports.isPending ? (
        <LoadingState label="Loading reports…" />
      ) : reports.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void reports.refetch()} />
      ) : !reports.data?.pages[0]?.ok ? (
        <NotConfiguredState feature="My reports" onRetry={() => void reports.refetch()} />
      ) : reportRows.length === 0 ? (
        <EmptyState
          icon="flag-outline"
          title="No reports filed"
          message="Reports you file are tracked here."
        />
      ) : (
        <View style={styles.list}>
          {reportRows.map((report) => (
            <Card key={report.id}>
              <Text style={[styles.reportTitle, { color: theme.colors.text }]}>
                {report.targetType} · {report.reason}
              </Text>
              <Text style={[styles.reportStatus, { color: theme.colors.textDim }]}>
                Status: {report.status}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

function BlockedList({ onError }: { onError: (message: string | null) => void }): ReactNode {
  const blocked = useBlockedUsers();
  const rows = (blocked.data?.pages ?? []).flatMap((page) => (page.ok ? page.data.items : []));
  if (blocked.isPending) return <LoadingState label="Loading blocked…" />;
  if (blocked.isError) {
    return <ErrorState message="Something went wrong." onRetry={() => void blocked.refetch()} />;
  }
  if (!blocked.data?.pages[0]?.ok) {
    return <NotConfiguredState feature="Blocked accounts" onRetry={() => void blocked.refetch()} />;
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        icon="shield-outline"
        title="Nobody blocked"
        message="Blocked accounts cannot see you or contact you."
      />
    );
  }
  return (
    <View style={styles.list}>
      {rows.map((profile) => (
        <UnblockRow
          key={profile.username}
          username={profile.username}
          name={profile.displayName}
          avatarUrl={profile.avatarUrl}
          onError={onError}
        />
      ))}
    </View>
  );
}

function UnblockRow({
  username,
  name,
  avatarUrl,
  onError,
}: {
  username: string;
  name: string;
  avatarUrl: string | null;
  onError: (message: string | null) => void;
}): ReactNode {
  const theme = useTheme();
  const toggle = useBlockToggle(username);

  async function handleUnblock(): Promise<void> {
    onError(null);
    const result = await toggle.mutateAsync(true);
    if (!result.ok) onError(result.error.message);
  }

  return (
    <View style={styles.row}>
      <Avatar uri={avatarUrl} name={name} size={44} />
      <Text style={[styles.rowName, { color: theme.colors.text }]}>{name}</Text>
      <Button
        title="Unblock"
        variant="secondary"
        onPress={() => void handleUnblock()}
        loading={toggle.isPending}
      />
    </View>
  );
}

function MutedList({ onError }: { onError: (message: string | null) => void }): ReactNode {
  const muted = useMutedUsers();
  const rows = (muted.data?.pages ?? []).flatMap((page) => (page.ok ? page.data.items : []));
  if (muted.isPending) return <LoadingState label="Loading muted…" />;
  if (muted.isError) {
    return <ErrorState message="Something went wrong." onRetry={() => void muted.refetch()} />;
  }
  if (!muted.data?.pages[0]?.ok) {
    return <NotConfiguredState feature="Muted accounts" onRetry={() => void muted.refetch()} />;
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        icon="volume-mute-outline"
        title="Nobody muted"
        message="Muted accounts are hidden from you only."
      />
    );
  }
  return (
    <View style={styles.list}>
      {rows.map((profile) => (
        <UnmuteRow
          key={profile.username}
          username={profile.username}
          name={profile.displayName}
          avatarUrl={profile.avatarUrl}
          onError={onError}
        />
      ))}
    </View>
  );
}

function UnmuteRow({
  username,
  name,
  avatarUrl,
  onError,
}: {
  username: string;
  name: string;
  avatarUrl: string | null;
  onError: (message: string | null) => void;
}): ReactNode {
  const theme = useTheme();
  const toggle = useMuteToggle(username);

  async function handleUnmute(): Promise<void> {
    onError(null);
    const result = await toggle.mutateAsync(true);
    if (!result.ok) onError(result.error.message);
  }

  return (
    <View style={styles.row}>
      <Avatar uri={avatarUrl} name={name} size={44} />
      <Text style={[styles.rowName, { color: theme.colors.text }]}>{name}</Text>
      <Button
        title="Unmute"
        variant="secondary"
        onPress={() => void handleUnmute()}
        loading={toggle.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: 14,
    marginBottom: 8,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  reportStatus: {
    fontSize: 13,
    marginTop: 2,
  },
});
