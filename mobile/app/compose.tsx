import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/theme/ThemeProvider';
import { track } from '@/lib/analytics';
import { extractHashtags } from '@/lib/parse';
import { POST_CATEGORIES } from '@/lib/constants';
import { firstIssue, postSchema } from '@/lib/validation';
import type { PostCategory } from '@/services/posts';
import { useCreatePost } from '@/hooks/usePosts';
import { uploadImages } from '@/services/media';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { DramaTagPicker } from '@/components/DramaTagPicker';
import type { DramaTagSelection } from '@/components/DramaTagPicker';

const MAX_CHARS = 5000;
const MAX_IMAGES = 4;

// Create Composer (blueprint 09): text, category, drama/episode tag,
// hashtags, spoiler toggle, media, preview, publish.
export default function Compose(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const create = useCreatePost();
  const [text, setText] = useState('');
  const [category, setCategory] = useState<PostCategory>('Discussion');
  const [spoiler, setSpoiler] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [tag, setTag] = useState<DramaTagSelection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const hashtags = extractHashtags(text);

  async function pickImages(): Promise<void> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...uris].slice(0, MAX_IMAGES));
    }
  }

  async function handlePublish(): Promise<void> {
    const parsed = postSchema.safeParse({ text, category });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    setBusy(true);
    setError(null);
    if (images.length > 0) {
      // Media must upload before the post is created; a failed upload
      // aborts the publish so no orphaned files are left behind.
      const uploaded = await uploadImages(images);
      if (!uploaded.ok) {
        setBusy(false);
        setError(uploaded.error.message);
        return;
      }
    }
    const result = await create.mutateAsync({
      text: parsed.data.text,
      category: parsed.data.category,
      mediaLocalUris: images,
      dramaId: tag?.dramaId,
      episodeId: tag?.episodeId,
      spoiler,
    });
    setBusy(false);
    if (result.ok) {
      track('post_created', { category, chars: text.length, images: images.length });
      router.back();
    } else {
      setError(result.error.message);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.colors.text }]}>New Post</Text>
        <Button title="Post" onPress={() => void handlePublish()} loading={busy} />
      </View>
      <TextField
        label="Post"
        value={text}
        onChangeText={(value) => {
          setText(value.slice(0, MAX_CHARS));
          setError(null);
        }}
        placeholder="Share what's happening in the fandom…"
        multiline
      />
      <Text style={[styles.counter, { color: theme.colors.textMuted }]}>
        {text.length} / {MAX_CHARS}
      </Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
        {POST_CATEGORIES.map((name) => (
          <View key={name} style={styles.pill}>
            <Chip label={name} selected={category === name} onPress={() => setCategory(name)} />
          </View>
        ))}
      </ScrollView>
      <Text style={[styles.section, { color: theme.colors.text }]}>Drama tag</Text>
      <DramaTagPicker selection={tag} onSelect={setTag} />
      {hashtags.length > 0 ? (
        <View style={styles.tags}>
          {hashtags.map((hashtag) => (
            <Chip key={hashtag} label={`#${hashtag}`} />
          ))}
        </View>
      ) : null}
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Contains spoilers</Text>
        <Switch
          value={spoiler}
          onValueChange={setSpoiler}
          accessibilityLabel="Contains spoilers"
          trackColor={{ true: theme.colors.brandBlue, false: theme.colors.surface3 }}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Media</Text>
        <Button
          title={images.length > 0 ? 'Add more' : 'Add photos'}
          variant="secondary"
          onPress={() => void pickImages()}
          disabled={images.length >= MAX_IMAGES}
        />
      </View>
      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((uri) => (
            <View key={uri} style={styles.thumb}>
              <Image source={{ uri }} accessibilityLabel="Selected photo" style={styles.image} />
              <Pressable
                onPress={() => setImages((prev) => prev.filter((u) => u !== uri))}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                style={[styles.remove, { backgroundColor: theme.colors.overlay }]}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}
      <Text style={[styles.section, { color: theme.colors.text }]}>Preview</Text>
      <Card>
        <Text style={[styles.previewName, { color: theme.colors.text }]}>You</Text>
        <Text style={[styles.previewMeta, { color: theme.colors.textMuted }]}>
          {category.toUpperCase()}
          {spoiler ? ' · SPOILER' : ''}
          {tag ? ` · ${tag.title}${tag.episodeNumber !== undefined ? ` Ep ${tag.episodeNumber}` : ''}` : ''}
        </Text>
        <Text style={[styles.previewText, { color: theme.colors.text }]}>
          {text.length > 0 ? text : 'Your post preview appears here.'}
        </Text>
      </Card>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
      <Button
        title="Preview & Publish"
        onPress={() => void handlePublish()}
        loading={busy}
      />
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
  counter: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  pills: {
    marginBottom: 8,
  },
  pill: {
    marginRight: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    minHeight: 44,
  },
  rowLabel: {
    fontSize: 16,
  },
  thumb: {
    marginRight: 8,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 9999,
    padding: 4,
  },
  previewName: {
    fontSize: 15,
    fontWeight: '600',
  },
  previewMeta: {
    fontSize: 12,
    marginVertical: 2,
  },
  previewText: {
    fontSize: 15,
    lineHeight: 21,
  },
  error: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 12,
  },
});
