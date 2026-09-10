import { firstIssue, loginSchema, resetSchema, signUpSchema } from '@/lib/validation';

describe('auth validation', () => {
  it('accepts a valid sign-up', () => {
    expect(signUpSchema.safeParse({ email: 'fan@hallyu.app', password: 'wavelength' }).success).toBe(true);
  });

  it('rejects bad email and short password', () => {
    const parsed = signUpSchema.safeParse({ email: 'not-an-email', password: 'short' });
    expect(parsed.success).toBe(false);
  });

  it('requires a password on login', () => {
    expect(loginSchema.safeParse({ email: 'fan@hallyu.app', password: '' }).success).toBe(false);
  });

  it('accepts a valid reset request', () => {
    expect(resetSchema.safeParse({ email: 'fan@hallyu.app' }).success).toBe(true);
  });

  it('firstIssue returns a human message', () => {
    const parsed = signUpSchema.safeParse({ email: '', password: '' });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(firstIssue(parsed.error).length).toBeGreaterThan(0);
  });
});
