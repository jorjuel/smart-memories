create table if not exists public.memories (
  code text primary key,
  recipient_name text not null,
  message text not null default '',
  sender_name text,
  photo_url text,
  audio_url text,
  video_url text,
  customer_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.memories enable row level security;
-- No public table policies are needed: the app accesses this table only through server routes.
insert into storage.buckets (id,name,public,file_size_limit)
values ('memory-media','memory-media',false,31457280)
on conflict (id) do nothing;
