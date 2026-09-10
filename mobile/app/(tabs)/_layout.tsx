import { Tabs, useRouter } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import type { ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useUnreadCount } from '@/hooks/useNotifications';

type IconName = ComponentProps<typeof Ionicons>['name'];

function icon(name: IconName, focusedName: IconName) {
  return function TabIcon({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }): ReactNode {
    return <Ionicons name={focused ? focusedName : name} size={size} color={color} />;
  };
}

export default function TabsLayout(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const unread = useUnreadCount();
  const badge =
    unread.data && unread.data.ok && unread.data.data.count > 0
      ? unread.data.data.count
      : undefined;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brandBlue,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: icon('home-outline', 'home') }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore', tabBarIcon: icon('compass-outline', 'compass') }}
      />
      <Tabs.Screen
        name="create"
        options={{ title: 'Create', tabBarIcon: icon('add-circle-outline', 'add-circle') }}
        listeners={{
          tabPress: (e) => {
            // Create opens the composer as a modal, not a tab screen.
            e.preventDefault();
            router.push('/compose');
          },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: icon('notifications-outline', 'notifications'),
          tabBarBadge: badge,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: icon('person-outline', 'person') }}
      />
    </Tabs>
  );
}
