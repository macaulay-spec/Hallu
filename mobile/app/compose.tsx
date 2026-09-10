import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

// Create Composer modal (blueprint 09). Phase 0 shell: the form is real
// and local; publishing honestly reports that no backend is linked.
// Full composer (tags, categories, media, preview) ships in Phase 1.
export default function Compose(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const [text, setText] = useState('');
  const [spoiler, setSpoiler] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePublish(): void {
    if (text.trim().length === 0) {
      setError('Write something first.');
      return;
    }
    setError('Backend not linked — your post was not published. Your draft is kept above.');
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.colors.text }]}>New Post</Text>
        <Button title="Post" onPress={handlePublish} />
      </View>
      <TextField
        label="Post"
        value={text}
        onChangeText={(value) => {
          setText(value);
          setError(null);
        }}
        placeholder="Share what's happening in the fandom…"
        multiline
      />
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Contains spoilers</Text>
        <Switch
          value={spoiler}
          onValueChange={setSpoiler}
          accessibilityLabel="Contains spoilers"
          trackColor={{ true: theme.colors.brandBlue, false: theme.colors.surface3 }}
        />
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  rowLabel: {
    fontSize: 16,
  },
  error: {
    fontSize: 14,
    marginTop: 12,
  },
});
