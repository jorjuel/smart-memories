-- Bring legacy memory installations up to the columns used by the app.
-- Keep existing media paths and bucket access settings intact.
alter table public.memories
  add column if not exists recipient_name text,
  add column if not exists sender_name text,
  add column if not exists photo_url text,
  add column if not exists audio_url text,
  add column if not exists video_url text,
  add column if not exists customer_id uuid references auth.users(id) on delete set null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'memories' and column_name = 'recipient'
  ) then
    update public.memories set recipient_name = recipient where recipient_name is null;
    alter table public.memories alter column recipient drop not null;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'memories' and column_name = 'sender'
  ) then
    update public.memories set sender_name = sender where sender_name is null;
  end if;
end
$$;

update storage.buckets
set file_size_limit = 31457280
where id = 'memory-media' and file_size_limit < 31457280;
