import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

interface WaveMarkProps {
  size?: number;
}

// Brand wave mark: gradient tile with a wave glyph. No image assets needed.
export function WaveMark({ size = 72 }: WaveMarkProps): ReactNode {
  const theme = useTheme();
  return (
    <View accessibilityLabel="Hallyu wave mark" accessibilityRole="image">
      <LinearGradient
        colors={[theme.colors.brandDeep, theme.colors.brandBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.tile, { width: size, height: size, borderRadius: size * 0.28 }]}
      >
        <Text style={[styles.wave, { fontSize: size * 0.52 }]}>∿</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: undefined,
  },
});
