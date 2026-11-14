-- Smart Memories referral foundation (NOT applied automatically).
-- Apply only after reviewing against the active production orders schema.
create extension if not exists pgcrypto;

create table if not exists public.referral_partners (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  contact_email text,
  referral_code text not null unique check (referral_code ~ '^[A-Z0-9-]{8,32}$'),
  commission_bps integer not null default 1000 check (commission_bps between 0 and 10000),
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now()
);
create table if not exists public.referral_tags (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.referral_partners(id),
  tag_type text not null check (tag_type in ('qr','nfc')),
  inventory_code text unique,
  status text not null default 'active' check (status in ('active','retired')),
  created_at timestamptz not null default now()
);
create table if not exists public.referral_visits (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.referral_partners(id),
  visited_at timestamptz not null default now(),
  -- No fingerprinting, IP addresses, or non-essential device identifiers.
  source text not null default 'link' check (source in ('link','qr','nfc'))
);
create table if not exists public.referral_attributions (
  order_id uuid primary key references public.orders(id),
  partner_id uuid not null references public.referral_partners(id),
  attributed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > attributed_at)
);
create table if not exists public.referral_commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id),
  partner_id uuid not null references public.referral_partners(id),
  eligible_pence bigint not null check (eligible_pence >= 0),
  commission_bps integer not null check (commission_bps between 0 and 10000),
  commission_pence bigint not null check (commission_pence >= 0),
  status text not null default 'pending' check (status in ('pending','approved','paid','reversed')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
create table if not exists public.referral_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.referral_partners(id),
  amount_pence bigint not null check (amount_pence > 0),
  payment_reference text,
  status text not null default 'draft' check (status in ('draft','paid','cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists referral_visits_partner_time_idx on public.referral_visits(partner_id,visited_at desc);
create index if not exists referral_commissions_partner_idx on public.referral_commissions(partner_id,status);

alter table public.referral_partners enable row level security;
alter table public.referral_tags enable row level security;
alter table public.referral_visits enable row level security;
alter table public.referral_attributions enable row level security;
alter table public.referral_commissions enable row level security;
alter table public.referral_payouts enable row level security;

-- Deliberately no public or authenticated access policies.
-- Server operations must verify owner permissions before using service role.
revoke all on public.referral_partners, public.referral_tags, public.referral_visits,
  public.referral_attributions, public.referral_commissions, public.referral_payouts
  from anon, authenticated;
