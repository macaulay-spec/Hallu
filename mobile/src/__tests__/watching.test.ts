import { watchingSchema } from '@/lib/validation';

describe('watching validation', () => {
  it('accepts valid progress', () => {
    expect(watchingSchema.safeParse({ dramaId: 'd1', episode: 8 }).success).toBe(true);
    expect(watchingSchema.safeParse({ dramaId: 'd1', episode: 0 }).success).toBe(true);
  });

  it('rejects missing drama and negative episodes', () => {
    expect(watchingSchema.safeParse({ dramaId: '', episode: 1 }).success).toBe(false);
    expect(watchingSchema.safeParse({ dramaId: 'd1', episode: -1 }).success).toBe(false);
    expect(watchingSchema.safeParse({ dramaId: 'd1', episode: 2.5 }).success).toBe(false);
  });
});
