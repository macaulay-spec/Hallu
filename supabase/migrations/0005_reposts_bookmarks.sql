-- 0005: reposts + private bookmarks (posts, dramas, episodes).
-- drama_id / episode_id foreign keys are attached in 0007.

create table public.reposts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  drama_id uuid,
  episode_id uuid,
  created_at timestamptz not null default now(),
  constraint bookmarks_exactly_one check (
    num_nonnulls(post_id, drama_id, episode_id) = 1
  )
);

create unique index bookmarks_post_uidx on public.bookmarks (user_id, post_id) where post_id is not null;
create unique index bookmarks_drama_uidx on public.bookmarks (user_id, drama_id) where drama_id is not null;
create unique index bookmarks_episode_uidx on public.bookmarks (user_id, episode_id) where episode_id is not null;
create index reposts_post_idx on public.reposts (post_id, created_at desc);

alter table public.reposts enable row level security;
alter table public.bookmarks enable row level security;

create policy "reposts are publicly readable"
  on public.reposts for select using (true);

create policy "users repost as themselves"
  on public.reposts for insert with check (auth.uid() = user_id);

create policy "users undo own reposts"
  on public.reposts for delete using (auth.uid() = user_id);

create policy "bookmarks are private to the owner"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
