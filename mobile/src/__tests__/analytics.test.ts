import { track } from '@/lib/analytics';

describe('analytics', () => {
  it('track never throws and never blocks', () => {
    expect(() => track('app_opened')).not.toThrow();
    expect(() => track('post_created', { category: 'Theory', chars: 120 })).not.toThrow();
  });
});
