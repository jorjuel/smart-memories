-- Commission creation and order attribution must be server-only.
-- Review against current orders.id type before applying in test database.
create or replace function public.referral_record_order_attribution(
  p_order_id uuid, p_referral_code text
) returns void language plpgsql security definer
set search_path = '' as $$
declare v_partner uuid;
begin
  if p_referral_code is null or p_referral_code !~ '^[A-Z0-9-]{8,32}$' then return; end if;
  select id into v_partner from public.referral_partners
  where referral_code = p_referral_code and status = 'active';
  if v_partner is null then return; end if;
  -- First valid attribution is immutable. Order is pending at this point.
  insert into public.referral_attributions (order_id, partner_id, attributed_at, expires_at)
  select o.id,v_partner,now(),now() + interval '30 days'
  from public.orders o where o.id = p_order_id and o.payment_status = 'pending'
  on conflict (order_id) do nothing;
end; $$;
revoke all on function public.referral_record_order_attribution(uuid,text) from public,anon,authenticated;
grant execute on function public.referral_record_order_attribution(uuid,text) to service_role;

create or replace function public.referral_record_paid_commission(p_order_id uuid)
returns void language plpgsql security definer
set search_path = '' as $$
declare v_order record; v_ref record; v_rate integer; v_amount bigint;
begin
  select id,subtotal_pence,payment_status,customer_email into v_order
  from public.orders where id=p_order_id;
  if not found or v_order.payment_status <> 'paid' then return; end if;
  select a.partner_id,a.expires_at,p.commission_bps,p.status,p.contact_email
    into v_ref
    from public.referral_attributions a
    join public.referral_partners p on p.id=a.partner_id
    where a.order_id=p_order_id;
  if not found or v_ref.expires_at < now() or v_ref.status <> 'active' then return; end if;
  -- Basic self-referral block. Extend with business-level fraud controls before launch.
  if v_ref.contact_email is not null and
     lower(v_ref.contact_email)=lower(v_order.customer_email) then return; end if;
  v_rate := v_ref.commission_bps;
  v_amount := v_order.subtotal_pence; -- Product subtotal; VAT handling to be reviewed.
  if v_amount is null or v_amount <= 0 then return; end if;
  insert into public.referral_commissions
    (order_id,partner_id,eligible_pence,commission_bps,commission_pence,status)
  values (p_order_id,v_ref.partner_id,v_amount,v_rate,(v_amount*v_rate+5000)/10000,'pending')
  on conflict (order_id) do nothing;
end; $$;
revoke all on function public.referral_record_paid_commission(uuid) from public,anon,authenticated;
grant execute on function public.referral_record_paid_commission(uuid) to service_role;
