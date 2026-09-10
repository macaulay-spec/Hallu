import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { track } from '@/lib/analytics';
import { usePost } from '@/hooks/usePosts';
import { usePostRemix, useRemixMeme } from '@/hooks/useAi';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PostCard } from '@/components/PostCard';

// Meme Remix: Gemini re-imagines a meme server-side, then you post it.
export default function Remix(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const source = usePost(postId);
  const remix = useRemixMeme();
  const publish = usePostRemix();
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(): Promise<void> {
    setError(null);
    const result = await remix.mutateAsync({
      postId,
      prompt: prompt.trim().length > 0 ? prompt.trim() : undefined,
    });
    if (result.ok) {
      setImageUrl(result.data.imageUrl);
    } else {
      setError(result.error.message);
    }
  }

  async function handlePost(): Promise<void> {
    if (!imageUrl) return;
    setError(null);
    const result = await publish.mutateAsync({
      sourcePostId: postId,
      imageUrl,
      caption: caption.trim(),
    });
    if (result.ok) {
      track('post_created', { category: 'Meme', remix: true });
      router.replace(`/post/${result.data.id}`);
    } else {
      setError(result.error.message);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Remix a meme" />
      {source.isPending ? (
        <LoadingState label="Loading meme…" />
      ) : source.isError ? (
        <ErrorState message="Something went wrong." onRetry={() => void source.refetch()} />
      ) : !source.data || !source.data.ok ? (
        <NotConfiguredState feature="Meme" onRetry={() => void source.refetch()} />
      ) : (
        <View style={styles.wrap}>
          <PostCard post={source.data.data} />
          <TextField
            label="Remix direction (optional)"
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Studio Ghibli version…"
          />
          <Button
            title="Generate remix"
            onPress={() => void handleGenerate()}
            loading={remix.isPending}
          />
          {imageUrl ? (
            <View style={styles.result}>
              <Image
                source={{ uri: imageUrl }}
                accessibilityLabel="Remixed meme"
                style={styles.image}
              />
              <TextField
                label="Caption"
                value={caption}
                onChangeText={setCaption}
                placeholder="Say something about your remix…"
                multiline
              />
              <Button
                title="Post remix"
                onPress={() => void handlePost()}
                loading={publish.isPending}
              />
            </View>
          ) : null}
        </View>
      )}
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  result: {
    gap: 12,
    marginTop: 4,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  error: {
    fontSize: 14,
    marginTop: 12,
  },
});
