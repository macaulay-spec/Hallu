-- 0011: communities — private visibility, member roles, moderation.
--
-- Model: the owner lives on communities.owner_id (no member row). Members and
-- moderators live in community_members. Bans are checked inside
-- community_viewer_role so a banned user reads as a stranger (a banned user
-- loses even private-community visibility). Community roles NEVER imply
-- platform powers — server code must never read them for moderation actions.

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  avatar_url text,
  banner_url text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint communities_name_len check (char_length(name) between 3 and 30),
  constraint communities_desc_len check (char_length(description) <= 280)
);

create unique index communities_name_unique_idx on public.communities (lower(name));

create table public.community_members (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator')),
  created_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table public.community_rules (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  position integer not null default 0,
  text text not null check (char_length(text) between 1 and 280)
);

create index community_rules_order_idx
  on public.community_rules (community_id, position, id);

create table public.community_bans (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table public.community_join_requests (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table public.community_posts (
  post_id uuid not null references public.posts (id) on delete cascade,
  community_id uuid not null references public.communities (id) on delete cascade,
  pinned_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (post_id, community_id)
);

create index community_posts_feed_idx on public.community_posts (community_id, created_at desc);

-- Viewer role: owner > moderator/member > null. Banned viewers read as null.
create or replace function public.community_viewer_role(community_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when exists (
        select 1 from public.community_bans b
        where b.community_id = community_viewer_role.community_id
          and b.user_id = auth.uid()
      ) then null
      when exists (
        select 1 from public.communities c
        where c.id = community_viewer_role.community_id and c.owner_id = auth.uid()
      ) then 'owner'
      else (
        select m.role from public.community_members m
        where m.community_id = community_viewer_role.community_id and m.user_id = auth.uid()
      )
    end;
$$;

create or replace function public.community_can_moderate(community_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.community_viewer_role(community_id) in ('owner', 'moderator');
$$;

alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_rules enable row level security;
alter table public.community_bans enable row level security;
alter table public.community_join_requests enable row level security;
alter table public.community_posts enable row level security;

-- Communities: public rows are world-readable; private rows need membership.
create policy "communities are visible to the world or members"
  on public.communities for select
  using (
    visibility = 'public' or public.community_viewer_role(id) is not null
  );

create policy "authenticated users can create communities"
  on public.communities for insert
  with check (auth.uid() is not null and owner_id = auth.uid());

create policy "owners can edit their community"
  on public.communities for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners can delete their community"
  on public.communities for delete
  using (owner_id = auth.uid());

-- Members: viewers see the roster; joins are self-serve on public
-- communities and moderator-driven on private ones.
create policy "community viewers can read the roster"
  on public.community_members for select
  using (public.community_viewer_role(community_id) is not null);

create policy "users can join public communities"
  on public.community_members for insert
  with check (
    user_id = auth.uid()
    and role = 'member'
    and exists (
      select 1 from public.communities c
      where c.id = community_id and c.visibility = 'public'
    )
  );

create policy "moderators can add members"
  on public.community_members for insert
  with check (public.community_can_moderate(community_id));

create policy "owners can change roles"
  on public.community_members for update
  using (
    exists (
      select 1 from public.communities c
      where c.id = community_id and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.communities c
      where c.id = community_id and c.owner_id = auth.uid()
    )
  );

create policy "members can leave; moderators can remove"
  on public.community_members for delete
  using (
    user_id = auth.uid() or public.community_can_moderate(community_id)
  );

-- Rules: readable by viewers, writable by moderators.
create policy "community viewers can read rules"
  on public.community_rules for select
  using (
    exists (
      select 1 from public.communities c
      where c.id = community_id
        and (c.visibility = 'public' or public.community_viewer_role(c.id) is not null)
    )
  );

create policy "moderators can manage rules"
  on public.community_rules for all
  using (public.community_can_moderate(community_id))
  with check (public.community_can_moderate(community_id));

-- Bans: moderators only.
create policy "moderators can manage bans"
  on public.community_bans for all
  using (public.community_can_moderate(community_id))
  with check (public.community_can_moderate(community_id));

-- Join requests: requesters see their own row; mods see all and decide.
create policy "requesters and moderators can read requests"
  on public.community_join_requests for select
  using (
    user_id = auth.uid() or public.community_can_moderate(community_id)
  );

create policy "strangers can request private access"
  on public.community_join_requests for insert
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and public.community_viewer_role(community_id) is null
  );

create policy "moderators can decide requests"
  on public.community_join_requests for update
  using (public.community_can_moderate(community_id))
  with check (public.community_can_moderate(community_id));

create policy "requesters can withdraw; moderators can clear"
  on public.community_join_requests for delete
  using (
    user_id = auth.uid() or public.community_can_moderate(community_id)
  );

-- Community posts: viewers see them; members attach their own posts;
-- moderators pin; moderators or the author detach.
create policy "community viewers can read community posts"
  on public.community_posts for select
  using (public.community_viewer_role(community_id) is not null);

create policy "members can attach their own posts"
  on public.community_posts for insert
  with check (
    public.community_viewer_role(community_id) is not null
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid() and p.deleted_at is null
    )
  );

create policy "moderators can pin posts"
  on public.community_posts for update
  using (public.community_can_moderate(community_id))
  with check (public.community_can_moderate(community_id));

create policy "moderators and authors can detach posts"
  on public.community_posts for delete
  using (
    public.community_can_moderate(community_id)
    or exists (
      select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()
    )
  );
