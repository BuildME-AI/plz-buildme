-- BuildMe (MVP) Supabase schema + RLS
-- Apply in Supabase SQL editor. Assumes Supabase Auth is enabled.

-- Extensions (safe if already enabled)
create extension if not exists "pgcrypto";

-- Enum for plan tier (free/premium/b2b)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'plan_tier') then
    create type public.plan_tier as enum ('free', 'premium', 'b2b');
  end if;
end $$;

-- User profile (maps to auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  plan public.plan_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Onboarding draft/profile answers (step-based)
create table if not exists public.onboarding_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  completed_step int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Usage events for rate limiting / billing metrics
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null, -- e.g. analysis, job_match, export_pdf
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_time_idx
  on public.usage_events (user_id, created_at desc);

-- Raw experience input (text or link)
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  source_type text not null default 'text', -- text | link
  source_text text, -- user pasted text
  source_url text,  -- sns link
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experiences_user_time_idx
  on public.experiences (user_id, created_at desc);

-- Interview session state
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  status text not null default 'active', -- active | completed | archived
  progress int not null default 0,
  ai_summary text, -- running summary for context compression
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interview_sessions_user_time_idx
  on public.interview_sessions (user_id, created_at desc);

-- Interview messages
create table if not exists public.interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null, -- user | ai | system
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists interview_messages_session_time_idx
  on public.interview_messages (session_id, created_at asc);

-- STAR-extended structured output + scoring + distortion flags
create table if not exists public.structured_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  session_id uuid references public.interview_sessions(id) on delete set null,

  situation text not null,
  role_and_action text not null,
  result text not null,
  growth text not null,

  specificity_score int not null default 0,
  impact_score int not null default 0,
  job_fit_score int not null default 0,
  overall_score int not null default 0,

  distortion_warnings jsonb not null default '[]'::jsonb,
  improvement_suggestions jsonb not null default '[]'::jsonb,
  assumptions jsonb not null default '[]'::jsonb, -- any "needs user confirmation" items

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists structured_experiences_user_time_idx
  on public.structured_experiences (user_id, created_at desc);

-- Job-tailored versions generated from a structured experience
create table if not exists public.job_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  structured_experience_id uuid not null references public.structured_experiences(id) on delete cascade,
  target_role text not null,
  target_company text,
  keywords jsonb not null default '[]'::jsonb,
  optimized_paragraph text not null,
  match_score int not null default 0,
  feedback jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists job_versions_structured_time_idx
  on public.job_versions (structured_experience_id, created_at desc);

-- Updated-at triggers (simple)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'profiles_set_updated_at') then
    create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'onboarding_profiles_set_updated_at') then
    create trigger onboarding_profiles_set_updated_at
    before update on public.onboarding_profiles
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'experiences_set_updated_at') then
    create trigger experiences_set_updated_at
    before update on public.experiences
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'interview_sessions_set_updated_at') then
    create trigger interview_sessions_set_updated_at
    before update on public.interview_sessions
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'structured_experiences_set_updated_at') then
    create trigger structured_experiences_set_updated_at
    before update on public.structured_experiences
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- RLS
alter table public.profiles enable row level security;
alter table public.onboarding_profiles enable row level security;
alter table public.usage_events enable row level security;
alter table public.experiences enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_messages enable row level security;
alter table public.structured_experiences enable row level security;
alter table public.job_versions enable row level security;

-- Policies: only owner can read/write own rows
do $$
begin
  -- profiles
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'profiles_select_own') then
    create policy profiles_select_own on public.profiles for select
      using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'profiles_insert_own') then
    create policy profiles_insert_own on public.profiles for insert
      with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'profiles_update_own') then
    create policy profiles_update_own on public.profiles for update
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  -- onboarding_profiles
  if not exists (select 1 from pg_policies where tablename = 'onboarding_profiles' and policyname = 'onboarding_profiles_crud_own') then
    create policy onboarding_profiles_crud_own on public.onboarding_profiles for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  -- usage_events
  if not exists (select 1 from pg_policies where tablename = 'usage_events' and policyname = 'usage_events_select_own') then
    create policy usage_events_select_own on public.usage_events for select
      using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'usage_events' and policyname = 'usage_events_insert_own') then
    create policy usage_events_insert_own on public.usage_events for insert
      with check (user_id = auth.uid());
  end if;

  -- experiences
  if not exists (select 1 from pg_policies where tablename = 'experiences' and policyname = 'experiences_crud_own') then
    create policy experiences_crud_own on public.experiences for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  -- interview_sessions
  if not exists (select 1 from pg_policies where tablename = 'interview_sessions' and policyname = 'interview_sessions_crud_own') then
    create policy interview_sessions_crud_own on public.interview_sessions for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  -- interview_messages
  if not exists (select 1 from pg_policies where tablename = 'interview_messages' and policyname = 'interview_messages_crud_own') then
    create policy interview_messages_crud_own on public.interview_messages for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  -- structured_experiences
  if not exists (select 1 from pg_policies where tablename = 'structured_experiences' and policyname = 'structured_experiences_crud_own') then
    create policy structured_experiences_crud_own on public.structured_experiences for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  -- job_versions
  if not exists (select 1 from pg_policies where tablename = 'job_versions' and policyname = 'job_versions_crud_own') then
    create policy job_versions_crud_own on public.job_versions for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

