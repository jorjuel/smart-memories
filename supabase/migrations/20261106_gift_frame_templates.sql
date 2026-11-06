-- Apply in Supabase SQL editor before using the owner design studio.
create table if not exists public.gift_frame_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  product_slugs text[] not null default '{}',
  orientation text not null default 'portrait' check (orientation in ('portrait','landscape','square')),
  asset_path text not null unique,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.gift_frame_templates enable row level security;
-- No direct client policies: the Next.js server validates owner on every write.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('gift-frame-overlays','gift-frame-overlays',true,5242880,array['image/png','image/webp'])
on conflict (id) do update set public=true, file_size_limit=5242880,
  allowed_mime_types=array['image/png','image/webp'];
-- Uploads are server-side using the service role only.
