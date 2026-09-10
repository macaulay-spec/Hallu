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

export const ONBOARDING_STEPS = 5;
