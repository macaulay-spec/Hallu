-- 0007: dramas + episodes + drama follows.
-- Attaches the deferred post/bookmark foreign keys from 0003/0005.

create table public.dramas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  korean_title text,
  synopsis text not null default '',
  poster_url text,
  backdrop_url text,
  status text not null check (status in ('airing', 'upcoming', 'completed')),
  year integer check (year is null or (year between 1900 and 2100)),
  episode_count integer not null default 0 check (episode_count >= 0),
  tmdb_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  drama_id uuid not null references public.dramas (id) on delete cascade,
  number integer not null check (number > 0),
  title text,
  synopsis text not null default '',
  air_date date,
  created_at timestamptz not null default now(),
  unique (drama_id, number)
);

create table public.drama_follows (
  user_id uuid not null references public.profiles (id) on delete cascade,
  drama_id uuid not null references public.dramas (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, drama_id)
);

create index dramas_status_idx on public.dramas (status, title);
create index dramas_title_trgm_idx on public.dramas (title);
create index episodes_drama_idx on public.episodes (drama_id, number);

alter table public.posts
  add constraint posts_drama_fk foreign key (drama_id)
  references public.dramas (id) on delete set null;

alter table public.posts
  add constraint posts_episode_fk foreign key (episode_id)
  references public.episodes (id) on delete set null;

alter table public.bookmarks
  add constraint bookmarks_drama_fk foreign key (drama_id)
  references public.dramas (id) on delete cascade;

alter table public.bookmarks
  add constraint bookmarks_episode_fk foreign key (episode_id)
  references public.episodes (id) on delete cascade;

alter table public.dramas enable row level security;
alter table public.episodes enable row level security;
alter table public.drama_follows enable row level security;

create policy "drama metadata is public"
  on public.dramas for select using (true);

create policy "episode metadata is public"
  on public.episodes for select using (true);

create policy "drama follows are publicly readable"
  on public.drama_follows for select using (true);

create policy "users follow dramas as themselves"
  on public.drama_follows for insert with check (auth.uid() = user_id);

create policy "users unfollow dramas as themselves"
  on public.drama_follows for delete using (auth.uid() = user_id);
