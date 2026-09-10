import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { track } from '@/lib/analytics';
import type { SearchEntity } from '@/services/search';
import { useSearch } from '@/hooks/useSearch';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { PostCard } from '@/components/PostCard';
import { DramaCard } from '@/components/drama/DramaCard';
import { UserRow } from '@/components/UserRow';

interface EntityOption {
  label: string;
  value: SearchEntity;
}

const ENTITIES: EntityOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Dramas', value: 'dramas' },
  { label: 'Actors', value: 'actors' },
  { label: 'Users', value: 'users' },
  { label: 'Communities', value: 'communities' },
  { label: 'Posts', value: 'posts' },
];

// Search Results (blueprint 16). Fully backend-driven; community rows
// become tappable in Phase 4 when community pages exist.
export default function Search(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [entity, setEntity] = useState<SearchEntity>('all');
  const search = useSearch(query, entity);

  const results = search.data && search.data.ok ? search.data.data : null;
  const isEmpty =
    results !== null &&
    results.dramas.length === 0 &&
    results.actors.length === 0 &&
    results.users.length === 0 &&
    results.communities.length === 0 &&
    results.posts.length === 0;

  return (
    <Screen scroll>
      <ScreenHeader title="Search" />
      <TextField
        label="Search"
        value={query}
        onChangeText={setQuery}
        placeholder="Queen"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.chips}>
        {ENTITIES.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={entity === option.value}
            onPress={() => {
              setEntity(option.value);
              track('search_performed', { entity: option.value });
            }}
          />
        ))}
      </View>
      <View style={styles.body}>
        {query.trim().length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="Search the fandom"
            message="Find dramas, actors, users, communities, and posts."
          />
        ) : search.isPending ? (
          <LoadingState label="Searching…" />
        ) : search.isError ? (
          <ErrorState message="Something went wrong." onRetry={() => void search.refetch()} />
        ) : !results ? (
          <NotConfiguredState feature="Search" onRetry={() => void search.refetch()} />
        ) : isEmpty ? (
          <EmptyState
            icon="search-outline"
            title="No matching dramas, actors, users, or communities found."
            message="Try a different search."
          />
        ) : (
          <View style={styles.sections}>
            {results.dramas.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dramas</Text>
                {results.dramas.map((drama) => (
                  <View key={drama.id} style={styles.item}>
                    <DramaCard drama={drama} />
                  </View>
                ))}
              </View>
            ) : null}
            {results.actors.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Actors</Text>
                {results.actors.map((actor) => (
                  <Pressable
                    key={actor.id}
                    onPress={() => router.push(`/actor/${actor.id}`)}
                    accessibilityRole="link"
                    accessibilityLabel={actor.name}
                    style={styles.actorRow}
                  >
                    <Avatar uri={actor.portraitUrl} name={actor.name} size={44} />
                    <Text style={[styles.actorName, { color: theme.colors.text }]}>
                      {actor.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {results.users.length > 0 || results.communities.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Users &amp; Communities
                </Text>
                {results.users.map((user) => (
                  <UserRow
                    key={user.username}
                    row={{ ...user, bio: '', following: false }}
                  />
                ))}
                {results.communities.map((community) => (
                  <Pressable
                    key={community.id}
                    onPress={() => router.push(`/community/${community.id}`)}
                    accessibilityRole="link"
                    accessibilityLabel={community.name}
                    style={styles.actorRow}
                  >
                    <Avatar uri={community.avatarUrl} name={community.name} size={44} />
                    <View>
                      <Text style={[styles.actorName, { color: theme.colors.text }]}>
                        {community.name}
                      </Text>
                      <Text style={[styles.communityMeta, { color: theme.colors.textMuted }]}>
                        Community · {community.memberCount} members
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {results.posts.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Posts</Text>
                {results.posts.map((post) => (
                  <View key={post.id} style={styles.item}>
                    <PostCard post={post} />
                  </View>
                ))}
              </View>
            ) : null}
            <Text style={[styles.end, { color: theme.colors.textMuted }]}>End of results</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  body: {
    flex: 1,
    marginTop: 12,
  },
  sections: {
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  item: {
    marginBottom: 4,
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  actorName: {
    fontSize: 15,
    fontWeight: '600',
  },
  communityMeta: {
    fontSize: 13,
  },
  end: {
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 8,
  },
});
