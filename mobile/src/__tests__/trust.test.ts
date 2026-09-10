import { reportSchema, verificationSchema } from '@/lib/validation';

describe('reportSchema', () => {
  it('accepts a valid report', () => {
    expect(
      reportSchema.safeParse({
        targetType: 'post',
        targetId: 'post-1',
        reason: 'spoiler-abuse',
        details: 'Untagged finale twist.',
      }).success,
    ).toBe(true);
  });

  it('rejects unknown targets, reasons, and long details', () => {
    expect(
      reportSchema.safeParse({ targetType: 'drama', targetId: 'd1', reason: 'spam' }).success,
    ).toBe(false);
    expect(
      reportSchema.safeParse({ targetType: 'post', targetId: 'p1', reason: 'rude' }).success,
    ).toBe(false);
    expect(
      reportSchema.safeParse({
        targetType: 'user',
        targetId: 'u1',
        reason: 'other',
        details: 'x'.repeat(501),
      }).success,
    ).toBe(false);
  });
});

describe('verificationSchema', () => {
  it('accepts individual and organization requests', () => {
    expect(
      verificationSchema.safeParse({
        accountType: 'individual',
        displayName: 'Bae Suzy',
        proofDetails: 'Official agency page: https://example.com/suzy',
      }).success,
    ).toBe(true);
    expect(
      verificationSchema.safeParse({
        accountType: 'organization',
        displayName: 'Studio Dragon',
        proofDetails: 'Corporate registry + official domain email.',
      }).success,
    ).toBe(true);
  });

  it('requires a name and meaningful proof', () => {
    expect(
      verificationSchema.safeParse({
        accountType: 'individual',
        displayName: 'A',
        proofDetails: 'Official agency page with bio.',
      }).success,
    ).toBe(false);
    expect(
      verificationSchema.safeParse({
        accountType: 'individual',
        displayName: 'Bae Suzy',
        proofDetails: 'trust me',
      }).success,
    ).toBe(false);
  });
});
