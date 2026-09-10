import type { ReactNode } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FollowList } from '@/components/profile/FollowList';

export default function FollowersScreen(): ReactNode {
  const { username } = useLocalSearchParams<{ username: string }>();
  return <FollowList username={username} mode="followers" title="Followers" />;
}
