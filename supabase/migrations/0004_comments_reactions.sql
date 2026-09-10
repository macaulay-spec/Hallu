-- 0004: comments (max depth 3) + post/comment reactions.
-- Deleting a comment deletes its replies (documented product choice).

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  depth integer not null default 1 check (depth between 1 and 3),
  text text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint comments_text_length check (char_length(text) between 1 and 2000)
);

create table public.post_reactions (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('like', 'love', 'laugh', 'sad', 'angry')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comment_reactions (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create index comments_post_idx on public.comments (post_id, created_at) where deleted_at is null;
create index comments_parent_idx on public.comments (parent_id, created_at) where deleted_at is null;
create index post_reactions_post_idx on public.post_reactions (post_id, kind);

alter table public.comments enable row level security;
alter table public.post_reactions enable row level security;
alter table public.comment_reactions enable row level security;

create policy "live comments are publicly readable"
  on public.comments for select using (deleted_at is null);

create policy "users comment as themselves"
  on public.comments for insert with check (auth.uid() = author_id);

create policy "authors delete own comments"
  on public.comments for delete using (auth.uid() = author_id);

create policy "reactions are publicly readable"
  on public.post_reactions for select using (true);

create policy "users react as themselves"
  on public.post_reactions for insert with check (auth.uid() = user_id);

create policy "users change own reaction"
  on public.post_reactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users remove own reaction"
  on public.post_reactions for delete using (auth.uid() = user_id);

create policy "comment likes are publicly readable"
  on public.comment_reactions for select using (true);

create policy "users like comments as themselves"
  on public.comment_reactions for insert with check (auth.uid() = user_id);

create policy "users unlike comments as themselves"
  on public.comment_reactions for delete using (auth.uid() = user_id);
