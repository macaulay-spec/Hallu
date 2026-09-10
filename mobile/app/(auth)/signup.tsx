import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { firstIssue, signUpSchema } from '@/lib/validation';
import { signInWithProvider } from '@/services/auth';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

// Sign Up (blueprint 03). Submits to the real service; with no backend
// linked the honest notConfigured error is shown. Nothing is faked.
export default function SignUp(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(): Promise<void> {
    const parsed = signUpSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    setBusy(true);
    setError(null);
    const result = await signUp(parsed.data.email, parsed.data.password);
    setBusy(false);
    if (!result.ok) setError(result.error.message);
  }

  async function handleProvider(provider: 'google' | 'apple'): Promise<void> {
    setBusy(true);
    setError(null);
    const result = await signInWithProvider(provider);
    setBusy(false);
    if (!result.ok) setError(result.error.message);
  }

  return (
    <Screen scroll>
      <View style={styles.wrap}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Join the fandom</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textDim }]}>
          Connect with fellow K-drama fans.
        </Text>
        <TextField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="8+ characters"
          secureTextEntry
        />
        {error ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}
        <Button title="Continue" onPress={() => void handleSubmit()} loading={busy} />
        <Text style={[styles.or, { color: theme.colors.textMuted }]}>Or continue with</Text>
        <Button
          title="Continue with Google"
          variant="secondary"
          onPress={() => void handleProvider('google')}
          disabled={busy}
        />
        <Button
          title="Continue with Apple"
          variant="secondary"
          onPress={() => void handleProvider('apple')}
          disabled={busy}
        />
        <Button
          title="Already a member? Log in"
          variant="ghost"
          onPress={() => router.push('/login')}
        />
        <Text style={[styles.terms, { color: theme.colors.textMuted }]}>
          By continuing you agree to the Terms and Privacy Policy.
        </Text>
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
  or: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
