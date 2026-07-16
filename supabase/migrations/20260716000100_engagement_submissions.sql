create table if not exists public.engagement_submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'newsletter', 'prayer', 'giving')),
  name text not null default '',
  email text not null default '',
  interest text not null default '',
  message text not null default '',
  reference text not null default '',
  source_path text not null default '',
  client_hash text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists engagement_submissions_status_created_idx
  on public.engagement_submissions (status, created_at desc);
create index if not exists engagement_submissions_client_created_idx
  on public.engagement_submissions (client_hash, created_at desc);

alter table public.engagement_submissions enable row level security;

-- Public visitors submit through the server route. Only the trusted service role
-- can read or mutate the inbox, so names, email addresses, and messages never
-- become queryable from the browser Supabase client.
revoke all on public.engagement_submissions from anon, authenticated;
grant all on public.engagement_submissions to service_role;
