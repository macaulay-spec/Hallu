-- 0001: identity + preferences.
-- Auth identity lives in auth.users (Supabase Auth). Application profile data
-- lives here. Verification can only ever be granted server-side: the
-- authenticated role is revoked from writing the verified column.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_.]{3,30}$'),
  constraint profiles_display_name_length check (char_length(display_name) <= 50),
  constraint profiles_bio_length check (char_length(bio) <= 160)
);

create unique index profiles_username_lower_uidx on public.profiles (lower(username));

create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  spoiler_mode text not null default 'on' check (spoiler_mode in ('on', 'off')),
  reduce_motion boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;

-- Verification is service-role only. Clients can never self-verify, even by
-- crafting direct update/insert payloads.
revoke update (verified) on public.profiles from authenticated;
revoke insert (verified) on public.profiles from authenticated;

create policy "profiles are publicly readable"
  on public.profiles for select using (true);

create policy "users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users manage own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
