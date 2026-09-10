import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useDramas } from '@/hooks/useDramas';
import { useDramaEpisodes } from '@/hooks/useEpisodes';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';

export interface DramaTagSelection {
  dramaId: string;
  title: string;
  episodeId?: string;
  episodeNumber?: number;
}

interface DramaTagPickerProps {
  selection: DramaTagSelection | null;
  onSelect: (selection: DramaTagSelection | null) => void;
}

// Composer drama/episode tagging: search live dramas, pick one, then an
// episode number. With no backend the search honestly reports it.
export function DramaTagPicker({ selection, onSelect }: DramaTagPickerProps): ReactNode {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [episodeText, setEpisodeText] = useState('');
  const search = useDramas({ query: query.trim().length > 0 ? query.trim() : undefined });
  const episodes = useDramaEpisodes(selection?.dramaId ?? '');

  const results = (search.data?.pages[0]?.ok ? search.data.pages[0].data.items : []).slice(0, 5);
  const episodeList = episodes.data && episodes.data.ok ? episodes.data.data : [];

  function pickEpisode(): void {
    const number = Number.parseInt(episodeText, 10);
    if (!selection || !Number.isFinite(number)) return;
    const match = episodeList.find((episode) => episode.number === number);
    onSelect({
      dramaId: selection.dramaId,
      title: selection.title,
      episodeId: match?.id,
      episodeNumber: number,
    });
  }

  if (selection) {
    return (
      <View style={[styles.selected, { backgroundColor: theme.colors.surface2 }]}>
        <Text style={[styles.selectedTitle, { color: theme.colors.text }]}>
          {selection.title}
          {selection.episodeNumber !== undefined ? ` · Ep ${selection.episodeNumber}` : ''}
        </Text>
        {selection.episodeNumber === undefined ? (
          <View style={styles.episodeRow}>
            <View style={styles.episodeField}>
              <TextField
                label="Episode number"
                value={episodeText}
                onChangeText={setEpisodeText}
                placeholder="8"
                keyboardType="default"
                autoCorrect={false}
              />
            </View>
            <Button title="Set" variant="secondary" onPress={pickEpisode} />
          </View>
        ) : null}
        <Button title="Clear tag" variant="ghost" onPress={() => onSelect(null)} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <TextField
        label="Tag a drama"
        value={query}
        onChangeText={setQuery}
        placeholder="Search dramas…"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {query.trim().length === 0 ? null : search.isPending ? (
        <Text style={[styles.hint, { color: theme.colors.textDim }]}>Searching…</Text>
      ) : !search.data?.pages[0]?.ok ? (
        <Text style={[styles.hint, { color: theme.colors.textDim }]}>
          Drama search needs a linked backend.
        </Text>
      ) : results.length === 0 ? (
        <Text style={[styles.hint, { color: theme.colors.textDim }]}>No matching dramas.</Text>
      ) : (
        results.map((drama) => (
          <Pressable
            key={drama.id}
            onPress={() => onSelect({ dramaId: drama.id, title: drama.title })}
            accessibilityRole="button"
            accessibilityLabel={`Tag ${drama.title}`}
            style={[styles.result, { backgroundColor: theme.colors.surface2 }]}
          >
            <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{drama.title}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  hint: {
    fontSize: 14,
  },
  result: {
    borderRadius: 8,
    padding: 12,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  selected: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  episodeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  episodeField: {
    flex: 1,
  },
});
