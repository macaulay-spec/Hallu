import { commentSchema, postSchema, profileSchema } from '@/lib/validation';

describe('post validation', () => {
  it('accepts a valid post', () => {
    expect(postSchema.safeParse({ text: 'That ending!', category: 'Reaction' }).success).toBe(true);
  });

  it('rejects empty and overlong text', () => {
    expect(postSchema.safeParse({ text: '  ', category: 'Meme' }).success).toBe(false);
    expect(postSchema.safeParse({ text: 'x'.repeat(5001), category: 'Meme' }).success).toBe(false);
  });

  it('rejects unknown categories', () => {
    expect(postSchema.safeParse({ text: 'hi', category: 'Vlog' }).success).toBe(false);
  });
});

describe('profile validation', () => {
  it('accepts a valid profile', () => {
    expect(profileSchema.safeParse({ displayName: 'Soojin', bio: 'Romance only' }).success).toBe(true);
  });

  it('rejects empty names and long bios', () => {
    expect(profileSchema.safeParse({ displayName: '', bio: '' }).success).toBe(false);
    expect(profileSchema.safeParse({ displayName: 'S', bio: 'x'.repeat(161) }).success).toBe(false);
  });
});

describe('comment validation', () => {
  it('accepts and rejects appropriately', () => {
    expect(commentSchema.safeParse({ text: 'Same!' }).success).toBe(true);
    expect(commentSchema.safeParse({ text: '' }).success).toBe(false);
  });
});
