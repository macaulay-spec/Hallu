import { imageUrl, mapActor, mapDrama, mapEpisode, mapStatus, mapYear } from '../../scripts/tmdb-map.js';

describe('tmdb mappers', () => {
  it('maps a show to a drama row', () => {
    const row = mapDrama({
      id: 126308,
      name: 'Queen of Tears',
      original_name: '눈물의 여왕',
      overview: 'A couple in crisis.',
      poster_path: '/poster.jpg',
      backdrop_path: null,
      status: 'Ended',
      first_air_date: '2024-03-09',
      number_of_episodes: 16,
    });
    expect(row).toEqual({
      title: 'Queen of Tears',
      korean_title: '눈물의 여왕',
      synopsis: 'A couple in crisis.',
      poster_url: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      backdrop_url: null,
      status: 'completed',
      year: 2024,
      episode_count: 16,
      tmdb_id: 126308,
    });
  });

  it('maps statuses and years defensively', () => {
    expect(mapStatus('Returning Series')).toBe('airing');
    expect(mapStatus('In Production')).toBe('upcoming');
    expect(mapStatus(undefined)).toBe('completed');
    expect(mapYear('2024-03-09')).toBe(2024);
    expect(mapYear(null)).toBeNull();
    expect(imageUrl(null)).toBeNull();
  });

  it('maps episodes and cast', () => {
    expect(mapEpisode({ episode_number: 8, name: 'Ep 8', overview: '', air_date: '2024-03-31', id: 5 }).number).toBe(8);
    expect(mapActor({ name: 'Kim Soo-hyun', profile_path: '/p.jpg', character: 'Baek Hyun-woo', id: 7 }).role).toBe('Baek Hyun-woo');
  });
});
