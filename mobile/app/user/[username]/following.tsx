import type { ReactNode } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FollowList } from '@/components/profile/FollowList';

export default function FollowingScreen(): ReactNode {
  const { username } = useLocalSearchParams<{ username: string }>();
  return <FollowList username={username} mode="following" title="Following" />;
}
