create extension if not exists pgcrypto;

create table if not exists public.content_documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('field-update', 'prayer-request', 'story', 'partner-church', 'active-need')),
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  summary text not null default '',
  body text not null default '',
  status text not null default 'draft' check (status in ('draft', 'review', 'published')),
  image text not null default '',
  image_alt text not null default '',
  church_slug text not null default '',
  program_slug text not null default '',
  published_on date,
  metadata jsonb not null default '{}'::jsonb,
  author_email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  revision integer not null default 1 check (revision > 0)
);

create index if not exists content_documents_kind_status_updated_idx
  on public.content_documents (kind, status, updated_at desc);

alter table public.content_documents enable row level security;

drop policy if exists "Published KMI content is public" on public.content_documents;
create policy "Published KMI content is public"
  on public.content_documents
  for select
  to anon, authenticated
  using (status = 'published');

grant select on public.content_documents to anon, authenticated;
grant all on public.content_documents to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-media',
  'content-media',
  true,
  12582912,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
