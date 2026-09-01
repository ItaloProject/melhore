-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Stores (tenants) ────────────────────────────────────────────────────────
create table stores (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  name          text not null,
  logo_url      text,
  banner_url    text,
  primary_color text not null default '#c026d3',
  phone         text,
  whatsapp      text,
  email         text,
  address       text,
  city          text,
  state         text,
  instagram     text,
  created_at    timestamptz not null default now()
);

-- ─── Store users (roles) ─────────────────────────────────────────────────────
create type store_role as enum ('owner', 'manager', 'cashier', 'viewer');

create table store_users (
  id         uuid primary key default uuid_generate_v4(),
  store_id   uuid not null references stores(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       store_role not null default 'cashier',
  created_at timestamptz not null default now(),
  unique(store_id, user_id)
);

-- ─── Categories ──────────────────────────────────────────────────────────────
create table categories (
  id       uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  name     text not null,
  slug     text not null,
  position int  not null default 0,
  unique(store_id, slug)
);

-- ─── Products ─────────────────────────────────────────────────────────────────
create table products (
  id            uuid primary key default uuid_generate_v4(),
  store_id      uuid not null references stores(id) on delete cascade,
  category_id   uuid references categories(id) on delete set null,
  name          text not null,
  description   text,
  sku           text,
  price         numeric(10,2) not null default 0,
  compare_price numeric(10,2),
  images        text[]        not null default '{}',
  active        boolean       not null default true,
  featured      boolean       not null default false,
  created_at    timestamptz   not null default now()
);

create index products_store_id_idx on products(store_id);

-- ─── Product Variants (size + color) ─────────────────────────────────────────
create table product_variants (
  id             uuid primary key default uuid_generate_v4(),
  product_id     uuid not null references products(id) on delete cascade,
  size           text,
  color          text,
  color_hex      text,
  sku            text,
  price_override numeric(10,2)
);

create index product_variants_product_id_idx on product_variants(product_id);

-- ─── Inventory ────────────────────────────────────────────────────────────────
create table inventory (
  id           uuid primary key default uuid_generate_v4(),
  store_id     uuid not null references stores(id) on delete cascade,
  variant_id   uuid not null references product_variants(id) on delete cascade,
  quantity     int  not null default 0,
  reserved     int  not null default 0,
  min_quantity int  not null default 3,
  updated_at   timestamptz not null default now(),
  unique(store_id, variant_id)
);

create index inventory_store_id_idx on inventory(store_id);

-- Trigger to update inventory.updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger inventory_updated_at
  before update on inventory
  for each row execute function set_updated_at();

-- ─── Inventory movements ─────────────────────────────────────────────────────
create type movement_type as enum ('sale','return','adjustment','reservation','release');

create table inventory_movements (
  id           uuid primary key default uuid_generate_v4(),
  store_id     uuid not null references stores(id) on delete cascade,
  variant_id   uuid not null references product_variants(id) on delete cascade,
  type         movement_type not null,
  quantity     int not null,
  note         text,
  reference_id uuid,
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id) on delete set null
);

-- ─── Orders (online / reservation) ───────────────────────────────────────────
create type order_status as enum ('pending','confirmed','reserved','shipped','delivered','cancelled');
create type order_type   as enum ('purchase','reservation');

create table orders (
  id              uuid primary key default uuid_generate_v4(),
  store_id        uuid not null references stores(id) on delete cascade,
  customer_name   text not null,
  customer_email  text,
  customer_phone  text,
  status          order_status not null default 'pending',
  type            order_type   not null default 'purchase',
  subtotal        numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  notes           text,
  created_at      timestamptz not null default now()
);

create index orders_store_id_idx on orders(store_id);

create table order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references orders(id) on delete cascade,
  variant_id    uuid not null references product_variants(id),
  product_name  text not null,
  variant_label text not null,
  quantity      int  not null,
  unit_price    numeric(10,2) not null,
  total         numeric(10,2) not null
);

-- ─── Cash sessions ────────────────────────────────────────────────────────────
create type cash_session_status as enum ('open','closed');

create table cash_sessions (
  id               uuid primary key default uuid_generate_v4(),
  store_id         uuid not null references stores(id) on delete cascade,
  opened_by        uuid not null references auth.users(id),
  closed_by        uuid references auth.users(id),
  opening_balance  numeric(10,2) not null default 0,
  closing_balance  numeric(10,2),
  opened_at        timestamptz not null default now(),
  closed_at        timestamptz,
  status           cash_session_status not null default 'open'
);

-- ─── Sales (PDV) ──────────────────────────────────────────────────────────────
create type payment_method as enum ('cash','credit','debit','pix','other');

create table sales (
  id             uuid primary key default uuid_generate_v4(),
  store_id       uuid not null references stores(id) on delete cascade,
  session_id     uuid not null references cash_sessions(id),
  seller_id      uuid references auth.users(id) on delete set null,
  payment_method payment_method not null,
  subtotal       numeric(10,2) not null default 0,
  discount       numeric(10,2) not null default 0,
  total          numeric(10,2) not null default 0,
  created_at     timestamptz not null default now()
);

create index sales_store_id_idx      on sales(store_id);
create index sales_session_id_idx    on sales(session_id);
create index sales_created_at_idx    on sales(created_at);

create table sale_items (
  id            uuid primary key default uuid_generate_v4(),
  sale_id       uuid not null references sales(id) on delete cascade,
  variant_id    uuid not null references product_variants(id),
  product_name  text not null,
  variant_label text not null,
  quantity      int  not null,
  unit_price    numeric(10,2) not null,
  total         numeric(10,2) not null
);

-- ─── Row-Level Security ───────────────────────────────────────────────────────
alter table stores           enable row level security;
alter table store_users      enable row level security;
alter table categories       enable row level security;
alter table products         enable row level security;
alter table product_variants enable row level security;
alter table inventory        enable row level security;
alter table inventory_movements enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table cash_sessions    enable row level security;
alter table sales            enable row level security;
alter table sale_items       enable row level security;

-- Helper: check if the current user belongs to a store
create or replace function is_store_member(sid uuid)
returns boolean language sql security definer as $$
  select exists(select 1 from store_users where store_id = sid and user_id = auth.uid());
$$;

-- Products & inventory are PUBLIC for consumer storefront (read-only)
create policy "public_read_products"
  on products for select using (active = true);

create policy "public_read_variants"
  on product_variants for select using (
    exists(select 1 from products where products.id = product_id and active = true)
  );

create policy "public_read_inventory"
  on inventory for select using (true);

create policy "public_read_categories"
  on categories for select using (true);

create policy "public_read_stores"
  on stores for select using (true);

-- Store members can read/write their store data
create policy "members_all_products"
  on products for all using (is_store_member(store_id));

create policy "members_all_variants"
  on product_variants for all using (
    is_store_member((select store_id from products where id = product_id))
  );

create policy "members_all_inventory"
  on inventory for all using (is_store_member(store_id));

create policy "members_all_sales"
  on sales for all using (is_store_member(store_id));

create policy "members_all_orders"
  on orders for all using (is_store_member(store_id));

create policy "members_all_cash"
  on cash_sessions for all using (is_store_member(store_id));

create policy "own_membership_select"
  on store_users for select
  using (auth.uid() = user_id);

create policy "members_update_own_store"
  on stores for update
  using (is_store_member(id));

-- ─── Function: create store for the signed-in owner ──────────────────────────
create or replace function public.create_store_for_current_user(
  p_name text,
  p_phone text default '',
  p_email text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_store_id uuid;
  v_slug text;
  v_name text;
  v_phone text;
begin
  if v_user_id is null then
    raise exception 'Não autenticado';
  end if;

  v_name := nullif(trim(p_name), '');
  if v_name is null then
    v_name := 'Minha Loja';
  end if;

  v_phone := nullif(trim(p_phone), '');

  select su.store_id into v_store_id
  from store_users su
  where su.user_id = v_user_id
  limit 1;

  if v_store_id is not null then
    if v_phone is not null then
      update stores
        set phone = v_phone,
            email = coalesce(email, p_email)
      where id = v_store_id;
    end if;
    return v_store_id;
  end if;

  v_slug := regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  if v_slug is null or v_slug = '' then
    v_slug := 'loja-' || substr(replace(v_user_id::text, '-', ''), 1, 8);
  end if;

  while exists(select 1 from stores where slug = v_slug) loop
    v_slug := v_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4);
  end loop;

  insert into stores (name, slug, phone, email)
  values (v_name, v_slug, v_phone, p_email)
  returning id into v_store_id;

  insert into store_users (store_id, user_id, role)
  values (v_store_id, v_user_id, 'owner');

  return v_store_id;
end;
$$;

revoke all on function public.create_store_for_current_user(text, text, text) from public;
grant execute on function public.create_store_for_current_user(text, text, text) to authenticated;

-- ─── Function: make a sale (atomic) ──────────────────────────────────────────
create or replace function make_sale(
  p_store_id    uuid,
  p_session_id  uuid,
  p_seller_id   uuid,
  p_payment     payment_method,
  p_discount    numeric,
  p_items       jsonb  -- [{variant_id, qty, unit_price, product_name, variant_label}]
)
returns uuid language plpgsql security definer as $$
declare
  v_sale_id   uuid;
  v_subtotal  numeric := 0;
  v_item      jsonb;
  v_avail     int;
begin
  -- Validate stock
  for v_item in select * from jsonb_array_elements(p_items) loop
    select quantity - reserved into v_avail
      from inventory
      where store_id = p_store_id and variant_id = (v_item->>'variant_id')::uuid;
    if v_avail < (v_item->>'qty')::int then
      raise exception 'Estoque insuficiente para variação %', v_item->>'variant_id';
    end if;
    v_subtotal := v_subtotal + (v_item->>'unit_price')::numeric * (v_item->>'qty')::int;
  end loop;

  -- Insert sale
  insert into sales(store_id, session_id, seller_id, payment_method, subtotal, discount, total)
  values(p_store_id, p_session_id, p_seller_id, p_payment, v_subtotal, p_discount, v_subtotal - p_discount)
  returning id into v_sale_id;

  -- Insert items + deduct stock
  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into sale_items(sale_id, variant_id, product_name, variant_label, quantity, unit_price, total)
    values(
      v_sale_id,
      (v_item->>'variant_id')::uuid,
      v_item->>'product_name',
      v_item->>'variant_label',
      (v_item->>'qty')::int,
      (v_item->>'unit_price')::numeric,
      (v_item->>'unit_price')::numeric * (v_item->>'qty')::int
    );

    update inventory
      set quantity = quantity - (v_item->>'qty')::int
      where store_id = p_store_id and variant_id = (v_item->>'variant_id')::uuid;

    insert into inventory_movements(store_id, variant_id, type, quantity, reference_id, created_by)
    values(p_store_id, (v_item->>'variant_id')::uuid, 'sale', -(v_item->>'qty')::int, v_sale_id, p_seller_id);
  end loop;

  return v_sale_id;
end;
$$;

-- ─── Function: reserve from online order ─────────────────────────────────────
create or replace function reserve_order(
  p_store_id uuid,
  p_items    jsonb
)
returns void language plpgsql security definer as $$
declare v_item jsonb; v_avail int;
begin
  for v_item in select * from jsonb_array_elements(p_items) loop
    select quantity - reserved into v_avail
      from inventory
      where store_id = p_store_id and variant_id = (v_item->>'variant_id')::uuid;
    if v_avail < (v_item->>'qty')::int then
      raise exception 'Estoque insuficiente para reserva';
    end if;
    update inventory
      set reserved = reserved + (v_item->>'qty')::int
      where store_id = p_store_id and variant_id = (v_item->>'variant_id')::uuid;
  end loop;
end;
$$;
