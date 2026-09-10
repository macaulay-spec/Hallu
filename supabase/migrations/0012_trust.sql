-- 0012: trust layer — notifications, blocks, mutes, reports,
-- platform roles, verification. All enforcement is server-side; clients only
-- render controls. Community roles NEVER imply platform powers.

create table public.platform_roles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role text not null check (role in ('moderator', 'admin')),
  granted_at timestamptz not null default now()
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  account_type text not null check (account_type in ('individual', 'organization')),
  display_name text not null check (char_length(display_name) between 2 and 60),
  proof text not null check (char_length(proof) between 10 and 1000),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null
    check (kind in ('reaction', 'comment', 'repost', 'follow', 'mention', 'community', 'system')),
  actor_id uuid references public.profiles (id) on delete set null,
  text text not null check (char_length(text) between 1 and 280),
  post_id uuid references public.posts (id) on delete cascade,
  community_id uuid references public.communities (id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_inbox_idx
  on public.notifications (user_id, created_at desc);
create index notifications_unread_idx
  on public.notifications (user_id) where read = false;

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.mutes (
  muter_id uuid not null references public.profiles (id) on delete cascade,
  muted_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (muter_id, muted_id),
  check (muter_id <> muted_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'user', 'community')),
  target_id text not null,
  reason text not null
    check (reason in ('spam', 'harassment', 'spoiler-abuse', 'misinformation', 'explicit', 'other')),
  details text not null default '' check (char_length(details) <= 500),
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz not null default now()
);

create index reports_queue_idx on public.reports (status, created_at);

-- Moderation audit log. No authenticated policies at all: only the service
-- role / edge functions write here, and only they read it.
create table public.mod_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references public.profiles (id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id text not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

alter table public.platform_roles enable row level security;
alter table public.verification_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.blocks enable row level security;
alter table public.mutes enable row level security;
alter table public.reports enable row level security;
alter table public.mod_actions enable row level security;

-- Platform roles: users may read their own row so the client can hide or
-- show moderation tooling. Grants happen out of band (service role only).
create policy "users can read their own platform role"
  on public.platform_roles for select
  using (user_id = auth.uid());

-- Verification: users file and track their own request. Approval flips
-- profiles.verified server-side only (see 0001 column grant).
create policy "users can read their own verification request"
  on public.verification_requests for select
  using (user_id = auth.uid());

create policy "users can file a verification request"
  on public.verification_requests for insert
  with check (user_id = auth.uid() and status = 'pending');

-- Notifications are fanned out by triggers/edge functions (which bypass
-- RLS); recipients can read and mark their own rows.
create policy "recipients can read notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "recipients can mark notifications read"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Blocks and mutes are strictly private to their owner. Feed and profile
-- queries exclude blocked/muted content server-side.
create policy "blockers own their block rows"
  on public.blocks for all
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

create policy "muters own their mute rows"
  on public.mutes for all
  using (muter_id = auth.uid())
  with check (muter_id = auth.uid());

-- Reports: reporters file and track their own; triage is server-side.
create policy "reporters can read their own reports"
  on public.reports for select
  using (reporter_id = auth.uid());

create policy "reporters can file reports"
  on public.reports for insert
  with check (reporter_id = auth.uid());
