import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { Avatar } from '@/components/ui/Avatar';

interface ActorCardProps {
  actorId: string;
  name: string;
  portraitUrl: string | null;
  role?: string | null;
}

export function ActorCard({ actorId, name, portraitUrl, role }: ActorCardProps): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/actor/${actorId}`)}
      accessibilityRole="link"
      accessibilityLabel={name}
      style={styles.card}
    >
      <Avatar uri={portraitUrl} name={name} size={64} />
      <View style={styles.text}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        {role ? (
          <Text style={[styles.role, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {role}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 96,
    alignItems: 'center',
    gap: 6,
  },
  text: {
    alignItems: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  role: {
    fontSize: 12,
    textAlign: 'center',
  },
});
