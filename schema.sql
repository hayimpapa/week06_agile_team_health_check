-- Squad Health Check — Supabase Schema
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable the pgcrypto extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- ============================================================
-- SESSIONS TABLE
-- ============================================================
create table sessions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  admin_pin  text not null,
  cards      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RESPONSES TABLE
-- ============================================================
create table responses (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references sessions(id) on delete cascade,
  respondent_token text not null,
  votes            jsonb not null default '{}'::jsonb,
  comments         jsonb not null default '{}'::jsonb,
  submitted_at     timestamptz not null default now(),
  -- Prevent same browser from submitting twice
  unique (session_id, respondent_token)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Turn on RLS
alter table sessions enable row level security;
alter table responses enable row level security;

-- Sessions: anyone can read any session (needed to load the voting page)
create policy "Sessions are publicly readable"
  on sessions for select
  using (true);

-- Sessions: anyone can create a session
create policy "Anyone can create a session"
  on sessions for insert
  with check (true);

-- Responses: anyone can insert a response
create policy "Anyone can submit a response"
  on responses for insert
  with check (true);

-- Responses: only requests that supply the correct admin PIN can read responses.
-- The caller sets a session variable before querying:
--   await supabase.rpc('set_config', { setting: 'app.admin_pin', value: pin })
-- Or via the header approach below.
--
-- We use a Postgres runtime config parameter: current_setting('request.headers', true)
-- Supabase passes custom headers as a JSON object in this setting.
-- The client sends the PIN as x-admin-pin header.
create policy "Admin can read responses with correct PIN"
  on responses for select
  using (
    exists (
      select 1 from sessions s
      where s.id = responses.session_id
        and s.admin_pin = current_setting('request.headers', true)::json->>'x-admin-pin'
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_responses_session_id on responses(session_id);
