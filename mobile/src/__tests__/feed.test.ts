import { scoreForYouPost, scoreTrendingHashtag, scoreTrendingPost } from '@/lib/feed';

describe('scoreForYouPost', () => {
  it('adds signal weights plus momentum', () => {
    const score = scoreForYouPost({
      followedAuthor: true,
      followedDrama: true,
      watchingDrama: true,
      genreInterest: true,
      reactions: 6,
      comments: 2,
      reposts: 0,
      ageHours: 2,
    });
    // 40 + 30 + 15 + 10 + (6 + 4 + 0) / sqrt(4)
    expect(score).toBeCloseTo(100, 5);
  });

  it('excludes old and future posts', () => {
    const base = {
      followedAuthor: false,
      followedDrama: false,
      watchingDrama: false,
      genreInterest: false,
      reactions: 0,
      comments: 0,
      reposts: 0,
    };
    expect(scoreForYouPost({ ...base, ageHours: 91 * 24 })).toBeNull();
    expect(scoreForYouPost({ ...base, ageHours: -1 })).toBeNull();
    expect(scoreForYouPost({ ...base, ageHours: 1 })).not.toBeNull();
  });
});

describe('scoreTrendingPost', () => {
  it('applies the trending formula', () => {
    const score = scoreTrendingPost({
      reactions: 4,
      comments: 2,
      reposts: 1,
      bookmarks: 3,
      ageHours: 2,
    });
    // (12 + 8 + 5 + 6) / 4^1.5 = 31 / 8
    expect(score).toBeCloseTo(3.875, 5);
  });

  it('enforces the 14-day window', () => {
    const base = { reactions: 100, comments: 100, reposts: 100, bookmarks: 100 };
    expect(scoreTrendingPost({ ...base, ageHours: 15 * 24 })).toBeNull();
    expect(scoreTrendingPost({ ...base, ageHours: 24 })).not.toBeNull();
  });
});

describe('scoreTrendingHashtag', () => {
  it('requires at least 2 posts', () => {
    expect(scoreTrendingHashtag(10, 1, 1)).toBeNull();
    expect(scoreTrendingHashtag(10, 2, 1)).toBeCloseTo(32 / 3, 5);
  });
});
