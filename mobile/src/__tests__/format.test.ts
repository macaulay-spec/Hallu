import { formatCount, timeAgo } from '@/lib/format';

describe('formatCount', () => {
  it('formats small numbers plainly', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(192)).toBe('192');
    expect(formatCount(999)).toBe('999');
  });

  it('formats thousands and millions', () => {
    expect(formatCount(1600)).toBe('1.6K');
    expect(formatCount(8400)).toBe('8.4K');
    expect(formatCount(12000)).toBe('12K');
    expect(formatCount(2_300_000)).toBe('2.3M');
  });

  it('never returns NaN for bad input', () => {
    expect(formatCount(Number.NaN)).toBe('0');
    expect(formatCount(-5)).toBe('0');
  });
});

describe('timeAgo', () => {
  const now = new Date('2026-09-10T12:00:00Z').getTime();

  it('formats seconds, minutes, hours', () => {
    expect(timeAgo('2026-09-10T11:59:30Z', now)).toBe('30s');
    expect(timeAgo('2026-09-10T11:58:00Z', now)).toBe('2m');
    expect(timeAgo('2026-09-10T10:00:00Z', now)).toBe('2h');
  });

  it('formats days and beyond', () => {
    expect(timeAgo('2026-09-07T12:00:00Z', now)).toBe('3d');
    expect(timeAgo('2026-08-10T12:00:00Z', now)).toBe('1mo');
  });

  it('returns empty for invalid dates', () => {
    expect(timeAgo('not-a-date', now)).toBe('');
  });
});
