import { StyleSheet, Text } from 'react-native';
import type { TextStyle } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { tokenizePostText } from '@/lib/parse';

// Renders post text with tappable hashtags and mentions.
export function ParsedText({ text, style }: { text: string; style?: TextStyle }): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const tokens = tokenizePostText(text);
  return (
    <Text style={[styles.body, { color: theme.colors.text }, style]}>
      {tokens.map((token, index) => {
        if (token.type === 'hashtag') {
          const tag = token.value.slice(1);
          return (
            <Text
              key={`${index}-${token.value}`}
              accessibilityRole="link"
              accessibilityLabel={`Hashtag ${tag}`}
              onPress={() => router.push(`/hashtag/${encodeURIComponent(tag)}`)}
              style={{ color: theme.colors.brandBlue }}
            >
              {token.value}
            </Text>
          );
        }
        if (token.type === 'mention') {
          const name = token.value.slice(1);
          return (
            <Text
              key={`${index}-${token.value}`}
              accessibilityRole="link"
              accessibilityLabel={`User ${name}`}
              onPress={() => router.push(`/user/${encodeURIComponent(name)}`)}
              style={{ color: theme.colors.brandBlue }}
            >
              {token.value}
            </Text>
          );
        }
        return <Text key={`${index}-t`}>{token.value}</Text>;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 21,
  },
});
