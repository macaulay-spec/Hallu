import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { WaveMark } from '@/components/WaveMark';

// Welcome / Get Started (blueprint 02).
export default function Welcome(): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const { enterPreviewMode } = useAuth();

  return (
    <Screen>
      <View style={styles.wrap}>
        <LinearGradient
          colors={[theme.colors.brandDeep, theme.colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hero}
        >
          <WaveMark size={96} />
        </LinearGradient>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Where the Wave Lives
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textDim }]}>
          The social home for K-drama fandom. Discuss, discover and connect.
        </Text>
        <View style={styles.cta}>
          <Button title="Get Started" onPress={() => router.push('/signup')} />
          <Button
            title="Already have an account"
            variant="ghost"
            onPress={() => router.push('/login')}
          />
          <Button
            title="Explore the interface (preview, no backend)"
            variant="ghost"
            onPress={enterPreviewMode}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  hero: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    gap: 4,
    marginTop: 16,
  },
});
