import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

void SplashScreen.preventAutoHideAsync().catch(() => {});

// Central route guard: signed-out users stay in (auth); everyone else must
// finish onboarding before reaching tabs; deep links cannot skip onboarding.
function Gate(): ReactNode {
  const { status, onboardingCompleted } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    if (status === 'signedOut') {
      if (!inAuth) router.replace('/welcome');
      return;
    }
    if (!onboardingCompleted) {
      if (!inOnboarding) router.replace('/onboarding/interests');
      return;
    }
    if (inAuth || inOnboarding || segments[0] === undefined) {
      router.replace('/home');
    }
  }, [status, onboardingCompleted, segments, router]);

  return null;
}

function ReadyGate({ fontsLoaded }: { fontsLoaded: boolean }): ReactNode {
  const { status } = useAuth();

  useEffect(() => {
    if (fontsLoaded && status !== 'loading') {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, status]);

  return <Gate />;
}

export default function RootLayout(): ReactNode {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
          <ReadyGate fontsLoaded={fontsLoaded} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen
              name="compose"
              options={{ presentation: 'modal', headerShown: false }}
            />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
