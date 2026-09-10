import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/theme/ThemeProvider';
import { firstIssue, profileSchema } from '@/lib/validation';
import { useOwnProfile, useUpdateProfile } from '@/hooks/useProfile';
import type { Profile } from '@/services/profiles';
import { uploadAvatar } from '@/services/media';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState } from '@/components/ui/LoadingState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';

function EditForm({ profile }: { profile: Profile }): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const update = useUpdateProfile();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [avatarLocal, setAvatarLocal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pickAvatar(): Promise<void> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarLocal(result.assets[0].uri);
    }
  }

  async function handleSave(): Promise<void> {
    const parsed = profileSchema.safeParse({ displayName, bio });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    setBusy(true);
    setError(null);
    let avatarUrl: string | null | undefined;
    if (avatarLocal) {
      const uploaded = await uploadAvatar(avatarLocal);
      if (!uploaded.ok) {
        setBusy(false);
        setError(uploaded.error.message);
        return;
      }
      avatarUrl = uploaded.data;
    }
    const result = await update.mutateAsync({
      displayName: parsed.data.displayName,
      bio: parsed.data.bio,
      avatarUrl,
    });
    setBusy(false);
    if (result.ok) {
      router.back();
    } else {
      setError(result.error.message);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Edit profile" />
      <View style={styles.wrap}>
        <View style={styles.avatarRow}>
          <Avatar uri={avatarLocal ?? profile.avatarUrl} name={displayName || profile.username} size={72} />
          <Button title="Change avatar" variant="secondary" onPress={() => void pickAvatar()} />
        </View>
        <TextField
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
        />
        <TextField
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Mostly romance & slow-burn"
          multiline
        />
        {error ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}
        <Button title="Save" onPress={() => void handleSave()} loading={busy} />
      </View>
    </Screen>
  );
}

export default function EditProfile(): ReactNode {
  const own = useOwnProfile();
  const profile = own.data && own.data.ok ? own.data.data : null;

  if (own.isPending) return <LoadingState label="Loading profile…" />;
  if (!profile) {
    return (
      <Screen>
        <ScreenHeader title="Edit profile" />
        <NotConfiguredState feature="Edit profile" onRetry={() => void own.refetch()} />
      </Screen>
    );
  }
  return <EditForm key={profile.id} profile={profile} />;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  error: {
    fontSize: 14,
  },
});
