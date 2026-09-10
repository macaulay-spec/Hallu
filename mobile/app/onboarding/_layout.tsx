import { Stack } from 'expo-router';
import type { ReactNode } from 'react';

export default function OnboardingLayout(): ReactNode {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="interests" />
      <Stack.Screen name="dramas" />
      <Stack.Screen name="actors" />
      <Stack.Screen name="communities" />
      <Stack.Screen name="completion" />
    </Stack>
  );
}
