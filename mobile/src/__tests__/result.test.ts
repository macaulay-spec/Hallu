import { DEFAULT_PAGE_LIMIT, err, notConfigured, ok } from '@/services/core';

describe('Result helpers', () => {
  it('ok wraps data', () => {
    const result = ok({ id: 1 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ id: 1 });
  });

  it('err wraps kind and message', () => {
    const result = err<string>('network', 'offline');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('network');
      expect(result.error.message).toBe('offline');
    }
  });

  it('notConfigured names the operation and stays honest', () => {
    const result = notConfigured<string[]>('Home feed');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('notConfigured');
      expect(result.error.message).toContain('Home feed');
    }
  });

  it('default page limit is sane', () => {
    expect(DEFAULT_PAGE_LIMIT).toBe(20);
  });
});
