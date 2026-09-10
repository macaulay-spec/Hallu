import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { firstIssue, resetSchema } from '@/lib/validation';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

// Account Recovery (blueprint 17).
export default function Recovery(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(): Promise<void> {
    const parsed = resetSchema.safeParse({ email });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    setBusy(true);
    setError(null);
    const result = await sendPasswordReset(parsed.data.email);
    setBusy(false);
    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error.message);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.wrap}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Forgot password?</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textDim }]}>
          Enter your email and we&apos;ll send a reset link.
        </Text>
        {sent ? (
          <Text accessibilityRole="alert" style={[styles.sent, { color: theme.colors.success }]}>
            Reset link sent. Check your inbox.
          </Text>
        ) : (
          <>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {error ? (
              <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
                {error}
              </Text>
            ) : null}
            <Button
              title="Send reset link"
              onPress={() => void handleSubmit()}
              loading={busy}
            />
          </>
        )}
        <Button
          title="Back to sign in"
          variant="ghost"
          onPress={() => router.push('/login')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    fontSize: 14,
  },
  sent: {
    fontSize: 14,
  },
});
