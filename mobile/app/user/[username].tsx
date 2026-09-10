import type { ReactNode } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { UserProfile } from '@/components/profile/UserProfile';

export default function UserScreen(): ReactNode {
  const { username } = useLocalSearchParams<{ username: string }>();
  return <UserProfile username={username} showBack />;
}
