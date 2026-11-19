create table public.fair_link_opens (
  id bigint generated always as identity primary key,
  source text not null check (source in ('qr', 'tap')),
  opened_at timestamptz not null default now()
);

create index fair_link_opens_source_opened_at_idx
  on public.fair_link_opens (source, opened_at desc);

alter table public.fair_link_opens enable row level security;
revoke all on table public.fair_link_opens from public, anon, authenticated;
grant select, insert on table public.fair_link_opens to service_role;
