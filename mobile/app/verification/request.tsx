import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { firstIssue, verificationSchema } from '@/lib/validation';
import { useRequestVerification, useVerificationStatus } from '@/hooks/useVerification';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';

// Verification Request (blueprint 29).
export default function VerificationRequest(): ReactNode {
  const theme = useTheme();
  const status = useVerificationStatus();
  const submit = useRequestVerification();
  const [accountType, setAccountType] = useState('Individual');
  const [displayName, setDisplayName] = useState('');
  const [proof, setProof] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const state = status.data && status.data.ok ? status.data.data.status : null;

  async function handleSubmit(): Promise<void> {
    const parsed = verificationSchema.safeParse({
      accountType: accountType === 'Individual' ? 'individual' : 'organization',
      displayName,
      proofDetails: proof,
    });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    setError(null);
    const result = await submit.mutateAsync(parsed.data);
    if (result.ok) {
      setDone(true);
    } else {
      setError(result.error.message);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Verification" />
      {status.isPending ? (
        <LoadingState label="Checking status…" />
      ) : status.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void status.refetch()} />
      ) : !state ? (
        <NotConfiguredState feature="Verification" onRetry={() => void status.refetch()} />
      ) : state === 'verified' ? (
        <EmptyState
          icon="checkmark-circle"
          title="You are verified"
          message="Your checkmark is visible on your profile."
        />
      ) : state === 'pending' || done ? (
        <EmptyState
          icon="time-outline"
          title="Request under review"
          message="We will notify you when a decision is made."
        />
      ) : (
        <View style={styles.form}>
          {state === 'rejected' ? (
            <Text style={[styles.note, { color: theme.colors.warning }]}>
              Your last request was declined. You can apply again with stronger proof.
            </Text>
          ) : null}
          <Text style={[styles.label, { color: theme.colors.textDim }]}>Account type</Text>
          <SegmentedControl
            options={['Individual', 'Organization']}
            value={accountType}
            onChange={setAccountType}
            accessibilityLabel="Account type"
          />
          <TextField
            label="Account name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Studio Dragon"
          />
          <TextField
            label="Proof of identity"
            value={proof}
            onChangeText={setProof}
            placeholder="Official site, press links, or references…"
            multiline
          />
          {error ? (
            <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
              {error}
            </Text>
          ) : null}
          <Button
            title="Submit request"
            onPress={() => void handleSubmit()}
            loading={submit.isPending}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  note: {
    fontSize: 14,
  },
  error: {
    fontSize: 14,
  },
});
