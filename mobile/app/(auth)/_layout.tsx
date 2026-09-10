import { Stack } from 'expo-router';
import type { ReactNode } from 'react';

export default function AuthLayout(): ReactNode {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="recovery" />
    </Stack>
  );
}
