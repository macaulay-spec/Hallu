// Pure mappers: TMDB API payloads -> Hallyu seed rows.
// No network, no secrets, no side effects. Tested in src/__tests__/tmdb-map.test.js.
// CommonJS so both node scripts and jest can load it without extra config.

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function imageUrl(path) {
  if (!path) return null;
  return `${IMAGE_BASE}${path}`;
}

function mapStatus(tmdbStatus) {
  if (tmdbStatus === 'Returning Series') return 'airing';
  if (tmdbStatus === 'In Production' || tmdbStatus === 'Planned') return 'upcoming';
  return 'completed';
}

function mapYear(firstAirDate) {
  if (!firstAirDate) return null;
  const year = Number.parseInt(String(firstAirDate).slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

function mapDrama(show) {
  return {
    title: show.name ?? 'Untitled',
    korean_title: show.original_name ?? null,
    synopsis: show.overview ?? '',
    poster_url: imageUrl(show.poster_path),
    backdrop_url: imageUrl(show.backdrop_path),
    status: mapStatus(show.status),
    year: mapYear(show.first_air_date),
    episode_count: show.number_of_episodes ?? 0,
    tmdb_id: show.id,
  };
}

function mapEpisode(episode) {
  return {
    number: episode.episode_number,
    title: episode.name ?? null,
    synopsis: episode.overview ?? '',
    air_date: episode.air_date ?? null,
    tmdb_id: episode.id,
  };
}

function mapActor(person) {
  return {
    name: person.name ?? 'Unknown',
    portrait_url: imageUrl(person.profile_path),
    role: person.character ?? null,
    tmdb_id: person.id,
  };
}

module.exports = { IMAGE_BASE, imageUrl, mapActor, mapDrama, mapEpisode, mapStatus, mapYear };
