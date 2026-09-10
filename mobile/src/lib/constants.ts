// Static product taxonomy (UI options, not user data).
export const GENRES = [
  'Romance',
  'Thriller',
  'Historical',
  'Comedy',
  'Mystery',
  'Fantasy',
  'Healing',
  'Office',
] as const;

export type Genre = (typeof GENRES)[number];

export const POST_CATEGORIES = [
  'Reaction',
  'Discussion',
  'Theory',
  'Recommendation',
  'Meme',
  'News',
  'Question',
  'Fan content',
] as const;

export const REACTION_KINDS = ['like', 'love', 'laugh', 'sad', 'angry'] as const;

export const ONBOARDING_STEPS = 5;
