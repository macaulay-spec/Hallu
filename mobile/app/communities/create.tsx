import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { firstIssue, communitySchema } from '@/lib/validation';
import type { CommunityVisibility } from '@/services/communities';
import { useCreateCommunity } from '@/hooks/useCommunities';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export default function CreateCommunity(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const create = useCreateCommunity();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(): Promise<void> {
    const parsed = communitySchema.safeParse({
      name,
      description,
      visibility: (visibility === 'Public' ? 'public' : 'private') as CommunityVisibility,
    });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    setError(null);
    const result = await create.mutateAsync(parsed.data);
    if (result.ok) {
      router.replace(`/community/${result.data.id}`);
    } else {
      setError(result.error.message);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="New community" />
      <View style={styles.wrap}>
        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Romance K-drama Fans"
        />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Soft romances, first kisses & chaos."
          multiline
        />
        <Text style={[styles.label, { color: theme.colors.textDim }]}>Visibility</Text>
        <SegmentedControl
          options={['Public', 'Private']}
          value={visibility}
          onChange={setVisibility}
          accessibilityLabel="Community visibility"
        />
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          Private communities are invisible and inaccessible to non-members.
        </Text>
        {error ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}
        <Button title="Create community" onPress={() => void handleCreate()} loading={create.isPending} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
  },
  error: {
    fontSize: 14,
  },
});
