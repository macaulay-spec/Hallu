import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { track } from '@/lib/analytics';
import { useFollowToggle } from '@/hooks/useFollows';
import { Button } from '@/components/ui/Button';

interface FollowButtonProps {
  username: string;
  following: boolean;
  compact?: boolean;
}

export function FollowButton({ username, following, compact = false }: FollowButtonProps): ReactNode {
  const theme = useTheme();
  const mutation = useFollowToggle(username);
  const [error, setError] = useState<string | null>(null);

  async function handlePress(): Promise<void> {
    setError(null);
    const result = await mutation.mutateAsync(following);
    if (!result.ok) {
      setError(result.error.message);
    } else if (!following) {
      track('user_followed', { username });
    }
  }

  return (
    <View>
      {compact ? (
        <Button
          title={following ? 'Following' : 'Follow'}
          variant={following ? 'secondary' : 'primary'}
          onPress={() => void handlePress()}
          loading={mutation.isPending}
        />
      ) : (
        <Button
          title={following ? 'Following' : 'Follow'}
          variant={following ? 'secondary' : 'primary'}
          onPress={() => void handlePress()}
          loading={mutation.isPending}
        />
      )}
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
