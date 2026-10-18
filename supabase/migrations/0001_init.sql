-- 0001_init: core schema + Row Level Security. Safe to re-run.
create extension if not exists pgcrypto;

create table if not exists memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','social_manager','booking_manager')),
  created_at timestamptz not null default now()
);

-- Owner passes every check; others need a listed role. SECURITY DEFINER so policies can read memberships.
create or replace function public.has_role(roles text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'owner' or role = any(roles) from memberships where user_id = auth.uid()), false)
$$;

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  artist_name text not null default 'Artist Name',
  tagline text, bio text, contact_email text,
  socials jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into site_settings (id) values (1) on conflict do nothing;

create table if not exists genres (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique);

create table if not exists mixes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text,
  cover_url text check (cover_url is null or cover_url ~ '^https://'),
  audio_url text check (audio_url is null or audio_url ~ '^https://'),
  duration_seconds int check (duration_seconds is null or duration_seconds > 0),
  release_date date,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','pending_approval','scheduled','published','failed','archived')),
  published_at timestamptz,
  seo_title text, seo_description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists mixes_pub_idx on mixes (status, featured desc, published_at desc);

create table if not exists mix_genres (
  mix_id uuid references mixes(id) on delete cascade,
  genre_id uuid references genres(id) on delete cascade,
  primary key (mix_id, genre_id)
);
create table if not exists tracklist_items (
  id uuid primary key default gen_random_uuid(),
  mix_id uuid not null references mixes(id) on delete cascade,
  position int not null, title text not null, artist text,
  start_seconds int check (start_seconds is null or start_seconds >= 0),
  unique (mix_id, position)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null, description text,
  poster_url text check (poster_url is null or poster_url ~ '^https://'),
  starts_at timestamptz not null,
  timezone text not null default 'Africa/Nairobi',
  venue_name text, city text,
  ticket_url text check (ticket_url is null or ticket_url ~ '^https://'),
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','cancelled','postponed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_start_idx on events (status, starts_at);

create table if not exists booking_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, phone text, organization text,
  event_type text not null, event_date date not null, venue text,
  audience_size int, duration_minutes int, budget_range text, details text,
  status text not null default 'new' check (status in ('new','contacted','negotiating','confirmed','completed','cancelled','archived')),
  assigned_to uuid references auth.users(id) on delete set null,
  follow_up_on date, internal_notes text, ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists booking_status_idx on booking_inquiries (status, created_at desc);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null, path text not null, mime text not null, size_bytes bigint not null,
  alt text, title text, caption text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

-- Social + publishing queue (UI/adapters come in later phases; schema is ready)
create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram','facebook','tiktok','youtube','x','linkedin','soundcloud','mixcloud','spotify')),
  account_name text, external_account_id text,
  status text not null default 'connected' check (status in ('connected','expired','revoked','error')),
  scopes text[] not null default '{}', token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (platform, external_account_id)
);
create table if not exists social_account_secrets (  -- encrypted tokens; RLS on, NO policies => service role only
  account_id uuid primary key references social_accounts(id) on delete cascade,
  access_token_enc text not null, refresh_token_enc text,
  updated_at timestamptz not null default now()
);
create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  caption text not null, media_ids uuid[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','pending_approval','scheduled','published','failed','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists social_post_targets (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references social_posts(id) on delete cascade,
  account_id uuid not null references social_accounts(id) on delete cascade,
  caption_override text, scheduled_for timestamptz,
  display_timezone text not null default 'Africa/Nairobi',
  unique (post_id, account_id)
);
create table if not exists publishing_jobs (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null unique references social_post_targets(id) on delete cascade,  -- unique = idempotency guard
  run_at timestamptz not null,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  attempts int not null default 0, next_retry_at timestamptz,
  external_post_id text, error_code text, error_message text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists jobs_due_idx on publishing_jobs (status, run_at);
create table if not exists publishing_attempts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references publishing_jobs(id) on delete cascade,
  started_at timestamptz not null default now(), finished_at timestamptz,
  ok boolean, error_code text, error_message text
);

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id) on delete set null,
  action text not null, entity text, entity_id text, meta jsonb,
  created_at timestamptz not null default now()
);
create table if not exists rate_limit_hits (key text not null, at timestamptz not null default now());
create index if not exists rate_limit_idx on rate_limit_hits (key, at desc);

-- updated_at triggers
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['site_settings','mixes','events','booking_inquiries','social_posts','publishing_jobs'] loop
    execute format('drop trigger if exists touch on %I', t);
    execute format('create trigger touch before update on %I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Row Level Security: staff policies per table (owner always passes via has_role)
do $$ declare r record; begin
  for r in select * from (values
    ('mixes','{editor}'),('events','{editor}'),('genres','{editor}'),('mix_genres','{editor}'),
    ('tracklist_items','{editor}'),('site_settings','{editor}'),('media_assets','{editor}'),
    ('booking_inquiries','{booking_manager}'),('social_posts','{social_manager}'),
    ('social_post_targets','{social_manager}'),('publishing_jobs','{social_manager}'),('publishing_attempts','{social_manager}')
  ) as v(tbl, roles) loop
    execute format('alter table %I enable row level security', r.tbl);
    execute format('drop policy if exists staff_all on %I', r.tbl);
    execute format('create policy staff_all on %I for all to authenticated using (public.has_role(%L::text[])) with check (public.has_role(%L::text[]))', r.tbl, r.roles, r.roles);
  end loop;
end $$;

-- Public read of published content only
alter table mixes enable row level security;
drop policy if exists public_read on mixes;
create policy public_read on mixes for select to anon, authenticated using (status = 'published');
drop policy if exists public_read on events;
create policy public_read on events for select to anon, authenticated using (status in ('published','cancelled','postponed'));
drop policy if exists public_read on genres;
create policy public_read on genres for select to anon, authenticated using (true);
drop policy if exists public_read on site_settings;
create policy public_read on site_settings for select to anon, authenticated using (true);
drop policy if exists public_read on tracklist_items;
create policy public_read on tracklist_items for select to anon, authenticated using (exists (select 1 from mixes m where m.id = mix_id and m.status = 'published'));
drop policy if exists public_read on mix_genres;
create policy public_read on mix_genres for select to anon, authenticated using (exists (select 1 from mixes m where m.id = mix_id and m.status = 'published'));

alter table memberships enable row level security;
drop policy if exists own_row on memberships;
create policy own_row on memberships for select to authenticated using (user_id = auth.uid());
drop policy if exists owner_all on memberships;
create policy owner_all on memberships for all to authenticated using (public.has_role('{}')) with check (public.has_role('{}'));

alter table social_accounts enable row level security;  -- read-only for managers; writes happen server-side (OAuth callback, service role)
drop policy if exists staff_read on social_accounts;
create policy staff_read on social_accounts for select to authenticated using (public.has_role('{social_manager}'));

alter table audit_logs enable row level security;
drop policy if exists owner_read on audit_logs;
create policy owner_read on audit_logs for select to authenticated using (public.has_role('{}'));
drop policy if exists staff_insert on audit_logs;
create policy staff_insert on audit_logs for insert to authenticated with check (actor = auth.uid() and public.has_role('{editor,social_manager,booking_manager}'));

alter table social_account_secrets enable row level security;  -- no policies: service role only
alter table rate_limit_hits enable row level security;         -- no policies: service role only

-- First owner (run once after creating your user in Supabase > Authentication):
--   insert into memberships (user_id, role) select id, 'owner' from auth.users where email = 'you@example.com';
