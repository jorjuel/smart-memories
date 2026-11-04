-- Phase 9.3: apply manually in Supabase SQL Editor before enabling cloud drafts.
-- Existing orders/memories are untouched.
create table if not exists public.memory_drafts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  title text not null default 'Untitled gift',
  step_index integer not null default 0 check (step_index between 0 and 10),
  details jsonb not null default '{}'::jsonb,
  photo_path text,
  audio_path text,
  status text not null default 'draft' check (status in ('draft','completed')),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists memory_drafts_owner_status_updated_idx
  on public.memory_drafts(user_id,status,updated_at desc);
alter table public.memory_drafts enable row level security;
revoke all on public.memory_drafts from anon;
grant select, insert, update, delete on public.memory_drafts to authenticated;
drop policy if exists "owner reads own draft" on public.memory_drafts;
create policy "owner reads own draft" on public.memory_drafts
for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "owner creates own draft" on public.memory_drafts;
create policy "owner creates own draft" on public.memory_drafts
for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "owner edits own draft" on public.memory_drafts;
create policy "owner edits own draft" on public.memory_drafts
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
drop policy if exists "owner deletes own draft" on public.memory_drafts;
create policy "owner deletes own draft" on public.memory_drafts
for delete to authenticated using (user_id = (select auth.uid()));
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('draft-media','draft-media',false,26214400,
array['image/jpeg','image/png','image/webp','image/heic','audio/webm','audio/mp4','audio/mpeg','audio/ogg','audio/wav','audio/x-wav'])
on conflict (id) do update set public=false, file_size_limit=26214400,
allowed_mime_types=excluded.allowed_mime_types;
-- No public read policies for draft-media. Server-side authenticated
-- owner checks issue short-lived signed read/upload URLs instead.
