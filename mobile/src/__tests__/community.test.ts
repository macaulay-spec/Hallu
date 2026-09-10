import {
  canBan,
  canEditRules,
  canManageRoles,
  canModerate,
  canPin,
  canReviewRequests,
  isMember,
} from '@/lib/community';
import { communitySchema, ruleSchema } from '@/lib/validation';

describe('community permissions', () => {
  it('grants nothing to strangers', () => {
    expect(isMember(null)).toBe(false);
    expect(canModerate(null)).toBe(false);
    expect(canPin(null)).toBe(false);
    expect(canBan(null)).toBe(false);
    expect(canEditRules(null)).toBe(false);
    expect(canReviewRequests(null)).toBe(false);
    expect(canManageRoles(null)).toBe(false);
  });

  it('grants membership without moderation to members', () => {
    expect(isMember('member')).toBe(true);
    expect(canModerate('member')).toBe(false);
    expect(canManageRoles('member')).toBe(false);
  });

  it('grants moderation — but not role management — to moderators', () => {
    expect(canModerate('moderator')).toBe(true);
    expect(canBan('moderator')).toBe(true);
    expect(canEditRules('moderator')).toBe(true);
    expect(canReviewRequests('moderator')).toBe(true);
    expect(canManageRoles('moderator')).toBe(false);
  });

  it('grants everything to owners', () => {
    expect(canModerate('owner')).toBe(true);
    expect(canManageRoles('owner')).toBe(true);
  });
});

describe('communitySchema', () => {
  it('accepts a valid community', () => {
    expect(
      communitySchema.safeParse({
        name: 'Romance Fans',
        description: 'Soft endings only.',
        visibility: 'public',
      }).success,
    ).toBe(true);
  });

  it('rejects short names, bad characters, and long descriptions', () => {
    expect(
      communitySchema.safeParse({ name: 'ab', description: '', visibility: 'public' }).success,
    ).toBe(false);
    expect(
      communitySchema.safeParse({ name: 'bad!name', description: '', visibility: 'public' }).success,
    ).toBe(false);
    expect(
      communitySchema.safeParse({
        name: 'Valid Name',
        description: 'x'.repeat(281),
        visibility: 'public',
      }).success,
    ).toBe(false);
  });

  it('validates rules', () => {
    expect(ruleSchema.safeParse({ text: 'Be kind.' }).success).toBe(true);
    expect(ruleSchema.safeParse({ text: '  ' }).success).toBe(false);
  });
});
