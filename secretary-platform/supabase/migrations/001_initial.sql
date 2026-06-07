-- AI Secretary Platform — initial schema
-- Run in Supabase SQL Editor or via Supabase CLI
--
-- Data retention: permanent (no TTL / auto-delete)
-- Auth: Google OAuth only (enable in Supabase Auth > Providers)
-- Multi-tenant / team features: not in scope

-- Task priority enum
create type public.task_priority as enum ('high', 'medium', 'low');

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  priority public.task_priority not null default 'medium',
  completed boolean not null default false,
  alert_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_due_date_idx on public.tasks (due_date) where not completed;

-- Writing style profile (for proofreading personalization)
create table public.writing_style_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade unique,
  tone_description text,
  sample_excerpts jsonb default '[]'::jsonb,
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Proofreading history
create table public.proofreading_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  original_text text not null,
  corrected_text text,
  suggestions jsonb,
  created_at timestamptz not null default now()
);

create index proofreading_history_user_id_idx on public.proofreading_history (user_id);

-- Meeting minutes
create table public.meeting_minutes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '無題の議事録',
  transcript text,
  discussed text,
  decisions text,
  next_actions text,
  audio_storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index meeting_minutes_user_id_idx on public.meeting_minutes (user_id);

-- Research sessions
create table public.research_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  theme text not null,
  generated_prompt text,
  summary text,
  sources jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index research_sessions_user_id_idx on public.research_sessions (user_id);

-- Google Calendar OAuth tokens (store encrypted at application layer)
create table public.google_calendar_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger writing_style_profiles_updated_at
  before update on public.writing_style_profiles
  for each row execute function public.set_updated_at();

create trigger meeting_minutes_updated_at
  before update on public.meeting_minutes
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.tasks enable row level security;
alter table public.writing_style_profiles enable row level security;
alter table public.proofreading_history enable row level security;
alter table public.meeting_minutes enable row level security;
alter table public.research_sessions enable row level security;
alter table public.google_calendar_tokens enable row level security;

create policy "Users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own writing profile"
  on public.writing_style_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own proofreading history"
  on public.proofreading_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own meeting minutes"
  on public.meeting_minutes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own research sessions"
  on public.research_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own calendar tokens"
  on public.google_calendar_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Expose tables to Supabase Data API (PostgREST)
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
notify pgrst, 'reload schema';
