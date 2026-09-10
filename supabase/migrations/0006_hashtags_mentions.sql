-- 0006: hashtags + mentions, extracted server-side from post/comment text.
-- Only the content author (or server) may attach tags to that content.

create table public.hashtags (
  tag text primary key check (tag ~ '^[a-z0-9_]{1,64}$'),
  created_at timestamptz not null default now()
);

create table public.post_hashtags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag text not null references public.hashtags (tag) on delete cascade,
  primary key (post_id, tag)
);

create table public.mentions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  mentioned_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint mentions_exactly_one check (
    num_nonnulls(post_id, comment_id) = 1
  )
);

create index post_hashtags_tag_idx on public.post_hashtags (tag, post_id);
create index mentions_user_idx on public.mentions (mentioned_user_id, created_at desc);

alter table public.hashtags enable row level security;
alter table public.post_hashtags enable row level security;
alter table public.mentions enable row level security;

create policy "hashtags are publicly readable"
  on public.hashtags for select using (true);

create policy "post tags are publicly readable"
  on public.post_hashtags for select using (true);

create policy "authors tag own posts"
  on public.post_hashtags for insert with check (
    exists (
      select 1 from public.posts
      where posts.id = post_hashtags.post_id and posts.author_id = auth.uid()
    )
  );

create policy "mentions are publicly readable"
  on public.mentions for select using (true);

create policy "authors mention from own content"
  on public.mentions for insert with check (
    exists (
      select 1 from public.posts
      where posts.id = mentions.post_id and posts.author_id = auth.uid()
    )
    or exists (
      select 1 from public.comments
      where comments.id = mentions.comment_id and comments.author_id = auth.uid()
    )
  );
