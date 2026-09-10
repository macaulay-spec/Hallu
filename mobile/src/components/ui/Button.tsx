import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
}: ButtonProps): ReactNode {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'secondary'
      ? theme.colors.surface2
      : variant === 'danger'
        ? theme.colors.danger
        : 'transparent';
  const textColor =
    variant === 'ghost' ? theme.colors.brandBlue : theme.colors.onBrand;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} accessibilityLabel="Loading" />
      ) : (
        <Text
          style={[
            styles.title,
            { color: textColor },
            variant === 'ghost' && styles.ghostTitle,
          ]}
        >
          {title}
        </Text>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[styles.pressable, isDisabled && styles.disabled]}
      >
        <LinearGradient
          colors={[theme.colors.brandDeep, theme.colors.brandBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.pressable,
        styles.plain,
        {
          backgroundColor,
          borderColor: theme.colors.border,
          borderWidth: variant === 'ghost' ? 0 : 1,
        },
        isDisabled && styles.disabled,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plain: {
    paddingHorizontal: 16,
  },
  gradient: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  ghostTitle: {
    fontSize: 14,
  },
});
