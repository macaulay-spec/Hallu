import { extractHashtags, extractMentions, tokenizePostText } from '@/lib/parse';

describe('tokenizePostText', () => {
  it('splits text, hashtags and mentions', () => {
    const tokens = tokenizePostText('Loved #Ep8 @soojin!');
    expect(tokens).toEqual([
      { type: 'text', value: 'Loved ' },
      { type: 'hashtag', value: '#Ep8' },
      { type: 'text', value: ' ' },
      { type: 'mention', value: '@soojin' },
      { type: 'text', value: '!' },
    ]);
  });

  it('returns one text token when nothing matches', () => {
    expect(tokenizePostText('plain')).toEqual([{ type: 'text', value: 'plain' }]);
  });
});

describe('extractHashtags', () => {
  it('lowercases and dedupes', () => {
    expect(extractHashtags('#Ep8 was wild #ep8 #OST')).toEqual(['ep8', 'ost']);
  });

  it('returns empty when none', () => {
    expect(extractHashtags('no tags')).toEqual([]);
  });
});

describe('extractMentions', () => {
  it('collects unique mentions', () => {
    expect(extractMentions('@soojin and @theorist, hi @soojin')).toEqual(['soojin', 'theorist']);
  });
});
