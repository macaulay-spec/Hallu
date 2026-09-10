-- 0008: actors + cast + genres + actor follows.

create table public.actors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text not null default '',
  portrait_url text,
  verified boolean not null default false,
  tmdb_id integer unique,
  created_at timestamptz not null default now()
);

create table public.drama_cast (
  drama_id uuid not null references public.dramas (id) on delete cascade,
  actor_id uuid not null references public.actors (id) on delete cascade,
  role text,
  position integer not null default 0,
  primary key (drama_id, actor_id)
);

create table public.genres (
  slug text primary key,
  label text not null
);

create table public.drama_genres (
  drama_id uuid not null references public.dramas (id) on delete cascade,
  genre_slug text not null references public.genres (slug) on delete cascade,
  primary key (drama_id, genre_slug)
);

create table public.actor_follows (
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.actors (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, actor_id)
);

insert into public.genres (slug, label) values
  ('romance', 'Romance'),
  ('thriller', 'Thriller'),
  ('historical', 'Historical'),
  ('comedy', 'Comedy'),
  ('mystery', 'Mystery'),
  ('fantasy', 'Fantasy'),
  ('healing', 'Healing'),
  ('office', 'Office')
on conflict (slug) do nothing;

create index drama_cast_drama_idx on public.drama_cast (drama_id, position);
create index drama_cast_actor_idx on public.drama_cast (actor_id, drama_id);

alter table public.actors enable row level security;
alter table public.drama_cast enable row level security;
alter table public.genres enable row level security;
alter table public.drama_genres enable row level security;
alter table public.actor_follows enable row level security;

-- Actor verification is service-role only, like profile verification.
revoke update (verified) on public.actors from authenticated;
revoke insert (verified) on public.actors from authenticated;

create policy "actor metadata is public"
  on public.actors for select using (true);

create policy "cast is public"
  on public.drama_cast for select using (true);

create policy "genres are public"
  on public.genres for select using (true);

create policy "drama genres are public"
  on public.drama_genres for select using (true);

create policy "actor follows are publicly readable"
  on public.actor_follows for select using (true);

create policy "users follow actors as themselves"
  on public.actor_follows for insert with check (auth.uid() = user_id);

create policy "users unfollow actors as themselves"
  on public.actor_follows for delete using (auth.uid() = user_id);
