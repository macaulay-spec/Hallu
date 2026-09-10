-- 0003: posts + media + drama/episode tags.
-- drama_id / episode_id foreign keys are attached in 0007 once those tables
-- exist. Spoiler text gating is hardened in 0009 (needs watched_episodes);
-- until then, deleted posts are hidden and authorship is enforced.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  category text not null check (category in (
    'Reaction', 'Discussion', 'Theory', 'Recommendation',
    'Meme', 'News', 'Question', 'Fan content'
  )),
  drama_id uuid,
  episode_id uuid,
  spoiler_episode integer check (spoiler_episode is null or spoiler_episode > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint posts_text_length check (char_length(text) between 1 and 5000)
);

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  url text not null,
  position integer not null default 0 check (position >= 0),
  alt_text text not null default '',
  unique (post_id, position)
);

create index posts_author_idx on public.posts (author_id, created_at desc);
create index posts_created_idx on public.posts (created_at desc) where deleted_at is null;
create index posts_drama_idx on public.posts (drama_id, created_at desc) where deleted_at is null;
create index posts_episode_idx on public.posts (episode_id, created_at desc) where deleted_at is null;

alter table public.posts enable row level security;
alter table public.post_media enable row level security;

create policy "live posts are publicly readable"
  on public.posts for select using (deleted_at is null);

create policy "users create own posts"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "authors update own posts"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "authors delete own posts"
  on public.posts for delete using (auth.uid() = author_id);

create policy "post media follows post visibility"
  on public.post_media for select using (
    exists (
      select 1 from public.posts
      where posts.id = post_media.post_id and posts.deleted_at is null
    )
  );

create policy "authors attach media to own posts"
  on public.post_media for insert with check (
    exists (
      select 1 from public.posts
      where posts.id = post_media.post_id and posts.author_id = auth.uid()
    )
  );

create policy "authors manage own post media"
  on public.post_media for delete using (
    exists (
      select 1 from public.posts
      where posts.id = post_media.post_id and posts.author_id = auth.uid()
    )
  );
