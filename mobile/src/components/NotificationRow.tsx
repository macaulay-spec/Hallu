import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { timeAgo } from '@/lib/format';
import type { NotificationItem, NotificationKind } from '@/services/notifications';
import { Avatar } from '@/components/ui/Avatar';

const KIND_ICON: Record<NotificationKind, ComponentProps<typeof Ionicons>['name']> = {
  reaction: 'heart',
  comment: 'chatbubble',
  repost: 'repeat',
  follow: 'person-add',
  mention: 'at',
  community: 'people',
  system: 'shield-checkmark',
};

export function NotificationRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: () => void;
}): ReactNode {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.text}
      style={[styles.row, { backgroundColor: item.read ? 'transparent' : theme.colors.surface }]}
    >
      {item.actor ? (
        <Avatar uri={item.actor.avatarUrl} name={item.actor.displayName} size={44} />
      ) : (
        <View style={[styles.icon, { backgroundColor: theme.colors.surface3 }]}>
          <Ionicons name={KIND_ICON[item.kind]} size={20} color={theme.colors.brandBlue} />
        </View>
      )}
      <View style={styles.text}>
        <Text style={[styles.body, { color: theme.colors.text }]} numberOfLines={3}>
          {item.text}
        </Text>
        <Text style={[styles.time, { color: theme.colors.textMuted }]}>
          {timeAgo(item.createdAt)}
        </Text>
      </View>
      {item.read ? null : <View style={[styles.dot, { backgroundColor: theme.colors.brandBlue }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
