// Pure hashtag/mention parsing for post text.

export type TextTokenType = 'text' | 'hashtag' | 'mention';

export interface TextToken {
  type: TextTokenType;
  value: string;
}

const TOKEN_RE = /(#[A-Za-z0-9_]+|@[A-Za-z0-9_.]+)/g;

export function tokenizePostText(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  let lastIndex = 0;
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null = TOKEN_RE.exec(text);
  while (match !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const value = match[0] ?? '';
    tokens.push({
      type: value.startsWith('#') ? 'hashtag' : 'mention',
      value,
    });
    lastIndex = match.index + value.length;
    match = TOKEN_RE.exec(text);
  }
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return tokens;
}

export function extractHashtags(text: string): string[] {
  const tags = tokenizePostText(text)
    .filter((token) => token.type === 'hashtag')
    .map((token) => token.value.slice(1).toLowerCase());
  return [...new Set(tags)];
}

export function extractMentions(text: string): string[] {
  const names = tokenizePostText(text)
    .filter((token) => token.type === 'mention')
    .map((token) => token.value.slice(1));
  return [...new Set(names)];
}
