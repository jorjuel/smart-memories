-- Card personalisations are created and read through server routes.
alter table public.card_personalisations enable row level security;
revoke all on table public.card_personalisations from public, anon, authenticated;
grant select, insert on table public.card_personalisations to service_role;

drop policy if exists "Server-only card personalisations" on public.card_personalisations;
create policy "Server-only card personalisations" on public.card_personalisations
as restrictive for all to anon, authenticated
using (false) with check (false);

-- Restrictive policies also guard against older broad Storage policies.
drop policy if exists "Server-only catalogue inserts" on storage.objects;
create policy "Server-only catalogue inserts" on storage.objects
as restrictive for insert to anon, authenticated
with check (bucket_id not in ('product-catalog', 'card-catalogue'));

drop policy if exists "Server-only catalogue updates" on storage.objects;
create policy "Server-only catalogue updates" on storage.objects
as restrictive for update to anon, authenticated
using (bucket_id not in ('product-catalog', 'card-catalogue'))
with check (bucket_id not in ('product-catalog', 'card-catalogue'));

drop policy if exists "Server-only catalogue deletes" on storage.objects;
create policy "Server-only catalogue deletes" on storage.objects
as restrictive for delete to anon, authenticated
using (bucket_id not in ('product-catalog', 'card-catalogue'));

drop policy if exists "Private card catalogue records" on storage.objects;
create policy "Private card catalogue records" on storage.objects
as restrictive for select to anon, authenticated
using (bucket_id <> 'card-catalogue');
