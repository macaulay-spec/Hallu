import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { LoadingState } from '@/components/ui/LoadingState';

// Fallback: the tab bar intercepts Create presses and pushes /compose.
// If this screen is ever reached directly, redirect there too.
export default function CreateRedirect(): ReactNode {
  const router = useRouter();
  useEffect(() => {
    router.replace('/compose');
  }, [router]);
  return <LoadingState label="Opening composer…" />;
}
