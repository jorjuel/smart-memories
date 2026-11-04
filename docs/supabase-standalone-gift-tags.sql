-- Smart Memories standalone gift tags — PRELAUNCH MIGRATION
-- Apply to Supabase only when ready to test activation against a test order.
-- NEVER store claim secrets in clear text or use NFC/QR public codes as ownership proof.

create table if not exists public.gift_tags (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique
    check (public_code ~ '^[A-Z2-9]{12}$'),
  claim_secret_hash text not null unique
    check (claim_secret_hash ~ '^[a-f0-9]{64}$'),
  paid_order_item_id uuid not null references public.order_items(id) on delete restrict,
  unit_index integer not null default 1 check (unit_index > 0),
  owner_user_id uuid references auth.users(id) on delete set null,
  memory_code text unique,
  status text not null default 'claimable'
    check (status in ('claimable', 'claimed', 'active', 'revoked')),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (paid_order_item_id, unit_index)
);

create index if not exists gift_tags_owner_user_idx
  on public.gift_tags(owner_user_id);

alter table public.gift_tags enable row level security;

-- Intentionally no client-facing SELECT, INSERT or UPDATE policies.
-- The public NFC route uses a restricted server-side read; claim uses
-- service-role RPC under verified authentication.
revoke all on public.gift_tags from anon, authenticated;

create or replace function public.claim_paid_gift_tag(
  p_public_code text,
  p_secret_hash text,
  p_owner_user_id uuid,
  p_verified_email text
)
returns table(tag_id uuid, tag_code text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_public_code !~ '^[A-Z2-9]{12}$'
     or p_secret_hash !~ '^[a-f0-9]{64}$'
     or length(trim(coalesce(p_verified_email, ''))) = 0 then
    return;
  end if;

  -- A single UPDATE is atomic: competing claims cannot both succeed.
  return query
  update public.gift_tags as gt
  set owner_user_id = p_owner_user_id,
      status = 'claimed',
      claimed_at = now(),
      updated_at = now()
  where gt.public_code = p_public_code
    and gt.claim_secret_hash = p_secret_hash
    and gt.status = 'claimable'
    and gt.owner_user_id is null
    and exists (
      select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.id = gt.paid_order_item_id
        and o.payment_status = 'paid'
        and lower(trim(o.customer_email)) = lower(trim(p_verified_email))
    )
  returning gt.id, gt.public_code;
end;
$$;

-- Do not allow client identities to call the SECURITY DEFINER claim RPC.
revoke all on function public.claim_paid_gift_tag(text,text,uuid,text)
  from public, anon, authenticated;
grant execute on function public.claim_paid_gift_tag(text,text,uuid,text)
  to service_role;

comment on table public.gift_tags is
  'Prelaunch gift tag records. Provision only after verified paid checkout; claim secrets are separate from public NFC codes.';
