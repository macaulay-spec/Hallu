// Client mirror of the server feed formulas (migration 0010, FIREBASE_BACKEND_PROMPT).
// The server ranks authoritatively; these pure functions document the contract,
// power client-side ordering of already-fetched items, and are unit-tested.

export interface ForYouSignals {
  followedAuthor: boolean;
  followedDrama: boolean;
  watchingDrama: boolean;
  genreInterest: boolean;
  reactions: number;
  comments: number;
  reposts: number;
  ageHours: number;
}

export const FOR_YOU_MAX_AGE_DAYS = 90;

export function scoreForYouPost(signals: ForYouSignals): number | null {
  if (signals.ageHours < 0 || signals.ageHours > FOR_YOU_MAX_AGE_DAYS * 24) return null;
  const momentum =
    (signals.reactions + 2 * signals.comments + 3 * signals.reposts) /
    Math.sqrt(signals.ageHours + 2);
  return (
    (signals.followedAuthor ? 40 : 0) +
    (signals.followedDrama ? 30 : 0) +
    (signals.watchingDrama ? 15 : 0) +
    (signals.genreInterest ? 10 : 0) +
    momentum
  );
}

export interface TrendingPostSignals {
  reactions: number;
  comments: number;
  reposts: number;
  bookmarks: number;
  ageHours: number;
}

export const TRENDING_POST_MAX_AGE_DAYS = 14;

export function scoreTrendingPost(signals: TrendingPostSignals): number | null {
  if (signals.ageHours < 0 || signals.ageHours > TRENDING_POST_MAX_AGE_DAYS * 24) return null;
  return (
    (3 * signals.reactions +
      4 * signals.comments +
      5 * signals.reposts +
      2 * signals.bookmarks) /
    Math.pow(signals.ageHours + 2, 1.5)
  );
}

export function scoreTrendingHashtag(
  participants: number,
  posts: number,
  ageHours: number,
): number | null {
  if (posts < 2 || ageHours < 0) return null;
  return (3 * participants + posts) / (ageHours + 2);
}
