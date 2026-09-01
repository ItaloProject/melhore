-- Platform console: store billing, activation, admin access, audit, backup.
-- 1. Rode este arquivo no SQL Editor do Supabase do Melhore.
-- 2. Libere seu login:
--    insert into platform_admin_emails (email) values ('SEU_EMAIL_AQUI');
--    ou defina PLATFORM_ADMIN_EMAILS=SEU_EMAIL_AQUI no .env / Vercel.

create table if not exists platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists platform_admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into platform_admin_emails (email)
values ('italo.fontes2026@gmail.com')
on conflict (email) do nothing;

alter table stores
  add column if not exists account_status text not null default 'active',
  add column if not exists billing_status text not null default 'trial',
  add column if not exists plan text not null default 'mensal',
  add column if not exists monthly_price numeric(10,2) not null default 97,
  add column if not exists trial_ends_at timestamptz default (now() + interval '14 days'),
  add column if not exists current_period_end timestamptz,
  add column if not exists last_payment_at timestamptz,
  add column if not exists grace_until timestamptz,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

alter table stores drop constraint if exists stores_account_status_check;
alter table stores add constraint stores_account_status_check
  check (account_status in ('active', 'inactive'));

alter table stores drop constraint if exists stores_billing_status_check;
alter table stores add constraint stores_billing_status_check
  check (billing_status in ('trial', 'paid', 'past_due', 'unpaid'));

create index if not exists stores_account_status_idx on stores(account_status);
create index if not exists stores_billing_status_idx on stores(billing_status);

create table if not exists store_payments (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  amount numeric(10,2) not null,
  paid_at timestamptz not null default now(),
  period_start date,
  period_end date,
  method text not null default 'pix',
  notes text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists store_payments_store_id_idx on store_payments(store_id);
create index if not exists store_payments_paid_at_idx on store_payments(paid_at desc);

create table if not exists platform_audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  store_id uuid references stores(id) on delete set null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists platform_audit_log_created_at_idx on platform_audit_log(created_at desc);

alter table platform_admins enable row level security;
alter table platform_admin_emails enable row level security;
alter table store_payments enable row level security;
alter table platform_audit_log enable row level security;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from platform_admins where user_id = auth.uid())
      or exists(
        select 1
        from platform_admin_emails
        where lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
      );
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

drop policy if exists "platform_admins_self" on platform_admins;
create policy "platform_admins_self"
  on platform_admins for select
  using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "platform_emails_admin" on platform_admin_emails;
create policy "platform_emails_admin"
  on platform_admin_emails for select
  using (public.is_platform_admin());

drop policy if exists "payments_admin_all" on store_payments;
create policy "payments_admin_all"
  on store_payments for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "payments_member_select" on store_payments;
create policy "payments_member_select"
  on store_payments for select
  using (public.is_store_member(store_id));

drop policy if exists "audit_admin_select" on platform_audit_log;
create policy "audit_admin_select"
  on platform_audit_log for select
  using (public.is_platform_admin());

create or replace function public.platform_log(
  p_action text,
  p_store_id uuid default null,
  p_details jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into platform_audit_log (actor_id, action, store_id, details)
  values (auth.uid(), p_action, p_store_id, coalesce(p_details, '{}'));
end;
$$;

create or replace function public.platform_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_stats jsonb;
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'Sem permissão';
  end if;

  select jsonb_build_object(
    'stores_total', (select count(*) from stores),
    'stores_active', (select count(*) from stores where account_status = 'active'),
    'stores_inactive', (select count(*) from stores where account_status = 'inactive'),
    'billing_paid', (select count(*) from stores where billing_status = 'paid'),
    'billing_trial', (select count(*) from stores where billing_status = 'trial'),
    'billing_late', (select count(*) from stores where billing_status in ('past_due', 'unpaid')),
    'users_total', (select count(*) from store_users),
    'cash_open', (select count(*) from cash_sessions where status = 'open'),
    'products_total', (select count(*) from products),
    'sales_month', (
      select coalesce(sum(total), 0)
      from sales
      where created_at >= date_trunc('month', now())
    )
  ) into v_stats;

  return v_stats;
end;
$$;

revoke all on function public.platform_dashboard_stats() from public;
grant execute on function public.platform_dashboard_stats() to authenticated;

create or replace function public.platform_list_stores()
returns table (
  id uuid,
  name text,
  slug text,
  phone text,
  email text,
  city text,
  account_status text,
  billing_status text,
  plan text,
  monthly_price numeric,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  last_payment_at timestamptz,
  grace_until timestamptz,
  notes text,
  created_at timestamptz,
  owner_email text,
  products_count bigint,
  sales_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'Sem permissão';
  end if;

  return query
  select
    s.id,
    s.name,
    s.slug,
    s.phone,
    s.email,
    s.city,
    s.account_status,
    s.billing_status,
    s.plan,
    s.monthly_price,
    s.trial_ends_at,
    s.current_period_end,
    s.last_payment_at,
    s.grace_until,
    s.notes,
    s.created_at,
    u.email::text as owner_email,
    (select count(*) from products p where p.store_id = s.id) as products_count,
    (select count(*) from sales sl where sl.store_id = s.id) as sales_count
  from stores s
  left join store_users su on su.store_id = s.id and su.role = 'owner'
  left join auth.users u on u.id = su.user_id
  order by s.created_at desc;
end;
$$;

revoke all on function public.platform_list_stores() from public;
grant execute on function public.platform_list_stores() to authenticated;

create or replace function public.platform_set_store_status(
  p_store_id uuid,
  p_account_status text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'Sem permissão';
  end if;
  if p_account_status not in ('active', 'inactive') then
    raise exception 'Status inválido';
  end if;

  update stores
    set account_status = p_account_status,
        notes = coalesce(p_notes, notes),
        updated_at = now()
  where id = p_store_id;

  perform public.platform_log(
    case when p_account_status = 'active' then 'store_activate' else 'store_deactivate' end,
    p_store_id,
    jsonb_build_object('notes', p_notes)
  );
end;
$$;

revoke all on function public.platform_set_store_status(uuid, text, text) from public;
grant execute on function public.platform_set_store_status(uuid, text, text) to authenticated;

create or replace function public.platform_update_store(
  p_store_id uuid,
  p_name text default null,
  p_phone text default null,
  p_email text default null,
  p_city text default null,
  p_monthly_price numeric default null,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'Sem permissão';
  end if;

  update stores
    set name = coalesce(nullif(trim(p_name), ''), name),
        phone = coalesce(p_phone, phone),
        email = coalesce(p_email, email),
        city = coalesce(p_city, city),
        monthly_price = coalesce(p_monthly_price, monthly_price),
        notes = coalesce(p_notes, notes),
        updated_at = now()
  where id = p_store_id;

  perform public.platform_log('store_update', p_store_id, '{}');
end;
$$;

revoke all on function public.platform_update_store(uuid, text, text, text, text, numeric, text) from public;
grant execute on function public.platform_update_store(uuid, text, text, text, text, numeric, text) to authenticated;

create or replace function public.platform_record_payment(
  p_store_id uuid,
  p_amount numeric,
  p_method text default 'pix',
  p_notes text default null,
  p_months int default 1
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_start date;
  v_end date;
  v_months int := greatest(coalesce(p_months, 1), 1);
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'Sem permissão';
  end if;

  v_start := current_date;
  v_end := (current_date + (v_months || ' months')::interval)::date;

  insert into store_payments (store_id, amount, method, notes, recorded_by, period_start, period_end)
  values (p_store_id, p_amount, coalesce(nullif(p_method, ''), 'pix'), p_notes, auth.uid(), v_start, v_end)
  returning id into v_id;

  update stores
    set billing_status = 'paid',
        account_status = 'active',
        last_payment_at = now(),
        current_period_end = v_end::timestamptz,
        grace_until = (v_end + interval '1 month'),
        updated_at = now()
  where id = p_store_id;

  perform public.platform_log(
    'payment_record',
    p_store_id,
    jsonb_build_object('amount', p_amount, 'months', v_months, 'method', p_method)
  );

  return v_id;
end;
$$;

revoke all on function public.platform_record_payment(uuid, numeric, text, text, int) from public;
grant execute on function public.platform_record_payment(uuid, numeric, text, text, int) to authenticated;

create or replace function public.platform_mark_unpaid(p_store_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'Sem permissão';
  end if;

  update stores
    set billing_status = 'past_due',
        grace_until = coalesce(grace_until, now() + interval '1 month'),
        updated_at = now()
  where id = p_store_id;

  perform public.platform_log('mark_unpaid', p_store_id, '{}');
end;
$$;

revoke all on function public.platform_mark_unpaid(uuid) from public;
grant execute on function public.platform_mark_unpaid(uuid) to authenticated;

create or replace function public.platform_store_backup(p_store_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payload jsonb;
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'Sem permissão';
  end if;

  select jsonb_build_object(
    'exported_at', now(),
    'store', (select to_jsonb(s) from stores s where s.id = p_store_id),
    'users', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'user_id', su.user_id,
        'role', su.role,
        'email', u.email,
        'created_at', su.created_at
      )), '[]'::jsonb)
      from store_users su
      left join auth.users u on u.id = su.user_id
      where su.store_id = p_store_id
    ),
    'categories', (select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) from categories c where c.store_id = p_store_id),
    'products', (select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from products p where p.store_id = p_store_id),
    'variants', (
      select coalesce(jsonb_agg(to_jsonb(v)), '[]'::jsonb)
      from product_variants v
      join products p on p.id = v.product_id
      where p.store_id = p_store_id
    ),
    'inventory', (select coalesce(jsonb_agg(to_jsonb(i)), '[]'::jsonb) from inventory i where i.store_id = p_store_id),
    'orders', (select coalesce(jsonb_agg(to_jsonb(o)), '[]'::jsonb) from orders o where o.store_id = p_store_id),
    'sales', (select coalesce(jsonb_agg(to_jsonb(sl)), '[]'::jsonb) from sales sl where sl.store_id = p_store_id),
    'cash_sessions', (select coalesce(jsonb_agg(to_jsonb(cs)), '[]'::jsonb) from cash_sessions cs where cs.store_id = p_store_id),
    'payments', (select coalesce(jsonb_agg(to_jsonb(pay)), '[]'::jsonb) from store_payments pay where pay.store_id = p_store_id)
  ) into v_payload;

  perform public.platform_log('store_backup', p_store_id, '{}');

  return v_payload;
end;
$$;

revoke all on function public.platform_store_backup(uuid) from public;
grant execute on function public.platform_store_backup(uuid) to authenticated;
