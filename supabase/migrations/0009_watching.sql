-- 0009: watching status + watched-through progress + server-side spoiler gate.
-- Spoiler posts are invisible (not just blurred) unless the viewer authored
-- them, turned spoiler mode off, or watched through >= the spoiler episode.
-- The same predicate guards comments via their parent post.

create table public.watching_status (
  user_id uuid not null references public.profiles (id) on delete cascade,
  drama_id uuid not null references public.dramas (id) on delete cascade,
  status text not null check (status in ('watching', 'completed')),
  updated_at timestamptz not null default now(),
  primary key (user_id, drama_id)
);

create table public.watched_episodes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  drama_id uuid not null references public.dramas (id) on delete cascade,
  watched_through integer not null default 0 check (watched_through >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, drama_id)
);

alter table public.watching_status enable row level security;
alter table public.watched_episodes enable row level security;

create policy "watching status is private to the owner"
  on public.watching_status for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "watch progress is private to the owner"
  on public.watched_episodes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Single spoiler predicate shared by the posts and comments policies.
-- Security definer so anonymous callers can evaluate it; it only reveals a
-- boolean about the caller's own progress row, never anyone else's.
create or replace function public.post_visible_to(
  viewer_id uuid,
  post_author uuid,
  post_drama uuid,
  post_spoiler integer,
  post_deleted timestamptz
) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select post_deleted is null
    and (
      post_author = viewer_id
      or post_spoiler is null
      or exists (
        select 1
        from watched_episodes w
        join user_preferences p on p.user_id = w.user_id
        where w.user_id = viewer_id
          and w.drama_id = post_drama
          and (p.spoiler_mode = 'off' or w.watched_through >= post_spoiler)
      )
    );
$$;

revoke all on function public.post_visible_to(uuid, uuid, uuid, integer, timestamptz)
  from public;
grant execute on function public.post_visible_to(uuid, uuid, uuid, integer, timestamptz)
  to authenticated, anon;

drop policy "live posts are publicly readable" on public.posts;

create policy "posts visible respecting spoiler gate"
  on public.posts for select using (
    public.post_visible_to(auth.uid(), author_id, drama_id, spoiler_episode, deleted_at)
  );

drop policy "live comments are publicly readable" on public.comments;

create policy "comments visible with their post"
  on public.comments for select using (
    deleted_at is null
    and exists (
      select 1 from public.posts
      where posts.id = comments.post_id
        and public.post_visible_to(
          auth.uid(), posts.author_id, posts.drama_id,
          posts.spoiler_episode, posts.deleted_at
        )
    )
  );
