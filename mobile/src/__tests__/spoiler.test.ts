import { isSpoilerHidden } from '@/lib/spoiler';

describe('isSpoilerHidden', () => {
  it('shows non-spoiler content', () => {
    expect(isSpoilerHidden(null, null, 'on')).toBe(false);
  });

  it('shows everything when spoiler mode is off', () => {
    expect(isSpoilerHidden(8, 6, 'off')).toBe(false);
  });

  it('hides when progress is unknown', () => {
    expect(isSpoilerHidden(8, null, 'on')).toBe(true);
  });

  it('hides episodes past watched-through', () => {
    expect(isSpoilerHidden(8, 6, 'on')).toBe(true);
  });

  it('shows episodes at or below watched-through', () => {
    expect(isSpoilerHidden(8, 8, 'on')).toBe(false);
    expect(isSpoilerHidden(8, 12, 'on')).toBe(false);
  });
});
