create table if not exists public.memories (
  code text primary key,
  recipient text not null,
  message text not null default '',
  sender text not null default '',
  photo_path text,
  audio_path text,
  created_at timestamptz not null default now()
);
alter table public.memories enable row level security;
-- No public table policies are needed: the app accesses this table only through server routes.
insert into storage.buckets (id,name,public,file_size_limit)
values ('memory-media','memory-media',false,26214400)
on conflict (id) do update set public=false, file_size_limit=26214400;
