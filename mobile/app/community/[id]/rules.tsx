import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { firstIssue, ruleSchema } from '@/lib/validation';
import { canEditRules } from '@/lib/community';
import { useAddRule, useCommunity, useCommunityRules, useDeleteRule } from '@/hooks/useCommunities';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function CommunityRules(): ReactNode {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const community = useCommunity(id);
  const rules = useCommunityRules(id);
  const add = useAddRule(id);
  const remove = useDeleteRule(id);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const data = community.data && community.data.ok ? community.data.data : null;
  const editable = canEditRules(data?.viewerRole ?? null);
  const items = rules.data && rules.data.ok ? rules.data.data : null;

  async function handleAdd(): Promise<void> {
    const parsed = ruleSchema.safeParse({ text: draft });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    setError(null);
    const result = await add.mutateAsync(parsed.data.text);
    if (result.ok) {
      setDraft('');
    } else {
      setError(result.error.message);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!pendingDelete) return;
    const ruleId = pendingDelete;
    setPendingDelete(null);
    setError(null);
    const result = await remove.mutateAsync(ruleId);
    if (!result.ok) setError(result.error.message);
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Rules" />
      {rules.isPending ? (
        <LoadingState label="Loading rules…" />
      ) : rules.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void rules.refetch()} />
      ) : !items ? (
        <NotConfiguredState feature="Community rules" onRetry={() => void rules.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No rules yet"
          message="The moderators have not set rules."
        />
      ) : (
        <View style={styles.list}>
          {items.map((rule, index) => (
            <Card key={rule.id}>
              <View style={styles.rule}>
                <Text style={[styles.ruleText, { color: theme.colors.text }]}>
                  {index + 1}. {rule.text}
                </Text>
                {editable ? (
                  <Button
                    title="Delete"
                    variant="danger"
                    onPress={() => setPendingDelete(rule.id)}
                  />
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      )}
      {editable ? (
        <View style={styles.add}>
          <TextField
            label="New rule"
            value={draft}
            onChangeText={setDraft}
            placeholder="Be kind. Mark spoilers."
          />
          {error ? (
            <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
              {error}
            </Text>
          ) : null}
          <Button title="Add rule" onPress={() => void handleAdd()} loading={add.isPending} />
        </View>
      ) : null}
      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Delete rule?"
        message="This cannot be undone."
        confirmTitle="Delete"
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  rule: {
    gap: 8,
  },
  ruleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  add: {
    gap: 12,
    marginTop: 16,
  },
  error: {
    fontSize: 14,
  },
});
