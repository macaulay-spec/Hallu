-- 0010: discovery support — interests, onboarding flag, engagement views.
--
-- FEED CONTRACT (the server implements these; mobile/src/lib/feed.ts mirrors them):
--   For You score = followed-author +40, followed-drama +30, watching +15,
--     genre-interest +10, momentum (reactions + 2*comments + 3*reposts) / (hours+2)^0.5.
--     Window: 90 days. Respects blocks/mutes/spoiler gate/moderation.
--   Following = chronological content from the followed graph.
--   Trending posts = (3*reactions + 4*comments + 5*reposts + 2*bookmarks) / (hours+2)^1.5.
--     Window: 14 days.
--   Trending hashtags = (3*participants + posts) / (hours+2), minimum 2 posts.
--
-- Views use security_invoker so the 0009 spoiler predicate keeps applying.

create table public.user_interests (
  user_id uuid not null references public.profiles (id) on delete cascade,
  genre_slug text not null references public.genres (slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, genre_slug)
);

alter table public.user_preferences
  add column if not exists onboarding_completed boolean not null default false;

alter table public.user_interests enable row level security;

create policy "interests are private to the owner"
  on public.user_interests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace view public.post_engagement
with (security_invoker = true) as
select
  p.id as post_id,
  count(distinct pr.user_id) as reactions,
  count(distinct c.id) as comments,
  count(distinct r.user_id) as reposts,
  count(distinct b.user_id) as bookmarks
from public.posts p
left join public.post_reactions pr on pr.post_id = p.id
left join public.comments c on c.post_id = p.id and c.deleted_at is null
left join public.reposts r on r.post_id = p.id
left join public.bookmarks b on b.post_id = p.id
where p.deleted_at is null
group by p.id;

create or replace view public.hashtag_stats
with (security_invoker = true) as
select
  ph.tag as tag,
  count(distinct ph.post_id) as posts,
  count(distinct p.author_id) as participants,
  max(p.created_at) as latest_post_at
from public.post_hashtags ph
join public.posts p on p.id = ph.post_id
where p.deleted_at is null
group by ph.tag;

-- Feed/trending access patterns.
create index if not exists posts_feed_window_idx
  on public.posts (created_at desc, id desc) where deleted_at is null;
create index if not exists posts_author_window_idx
  on public.posts (author_id, created_at desc) where deleted_at is null;
create index if not exists post_hashtags_recent_idx
  on public.post_hashtags (tag, post_id);
create index if not exists user_interests_genre_idx
  on public.user_interests (genre_slug, user_id);
