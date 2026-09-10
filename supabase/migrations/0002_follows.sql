-- 0002: user-to-user follows.

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint follows_no_self check (follower_id <> followee_id)
);

create index follows_followee_idx on public.follows (followee_id, follower_id);
create index follows_follower_idx on public.follows (follower_id, followee_id);

alter table public.follows enable row level security;

create policy "follows are publicly readable"
  on public.follows for select using (true);

create policy "users follow as themselves"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "users unfollow as themselves"
  on public.follows for delete using (auth.uid() = follower_id);
