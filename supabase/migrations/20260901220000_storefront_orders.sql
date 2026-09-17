-- Security hardening: make_sale() is security definer but never checked
-- that the caller belongs to p_store_id, and had no explicit grants —
-- Postgres defaults function EXECUTE to PUBLIC, so any authenticated (or
-- anon) user could have called it against a store they don't own. Add the
-- membership check and lock the grant down to authenticated store members.
create or replace function make_sale(
  p_store_id    uuid,
  p_session_id  uuid,
  p_seller_id   uuid,
  p_payment     payment_method,
  p_discount    numeric,
  p_items       jsonb
)
returns uuid language plpgsql security definer as $$
declare
  v_sale_id   uuid;
  v_subtotal  numeric := 0;
  v_item      jsonb;
  v_avail     int;
begin
  if not is_store_member(p_store_id) then
    raise exception 'Sem permissão';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select quantity - reserved into v_avail
      from inventory
      where store_id = p_store_id and variant_id = (v_item->>'variant_id')::uuid;
    if v_avail < (v_item->>'qty')::int then
      raise exception 'Estoque insuficiente para variação %', v_item->>'variant_id';
    end if;
    v_subtotal := v_subtotal + (v_item->>'unit_price')::numeric * (v_item->>'qty')::int;
  end loop;

  insert into sales(store_id, session_id, seller_id, payment_method, subtotal, discount, total)
  values(p_store_id, p_session_id, p_seller_id, p_payment, v_subtotal, p_discount, v_subtotal - p_discount)
  returning id into v_sale_id;

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

revoke all on function make_sale(uuid, uuid, uuid, payment_method, numeric, jsonb) from public;
grant execute on function make_sale(uuid, uuid, uuid, payment_method, numeric, jsonb) to authenticated;

-- Storefront checkout: lets an anonymous customer place an order without
-- needing direct INSERT policies on orders/order_items. Mirrors the
-- make_sale() pattern used by the PDV — validates stock, creates the
-- order atomically, and reserves inventory (does not deduct it; deduction
-- happens when the store owner confirms/fulfills the order).

create or replace function public.place_order(
  p_store_slug     text,
  p_customer_name  text,
  p_customer_email text,
  p_customer_phone text,
  p_type           order_type,
  p_notes          text,
  p_items          jsonb  -- [{variant_id, product_name, variant_label, quantity, unit_price}]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id uuid;
  v_order_id uuid;
  v_subtotal numeric := 0;
  v_item     jsonb;
  v_avail    int;
begin
  if p_customer_name is null or trim(p_customer_name) = '' then
    raise exception 'Informe o nome do cliente';
  end if;

  select id into v_store_id from stores where slug = p_store_slug;
  if v_store_id is null then
    raise exception 'Loja não encontrada';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Carrinho vazio';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select quantity - reserved into v_avail
      from inventory
      where store_id = v_store_id and variant_id = (v_item->>'variant_id')::uuid;
    if v_avail is null or v_avail < (v_item->>'quantity')::int then
      raise exception 'Estoque insuficiente para %', v_item->>'product_name';
    end if;
    v_subtotal := v_subtotal + (v_item->>'unit_price')::numeric * (v_item->>'quantity')::int;
  end loop;

  insert into orders (store_id, customer_name, customer_email, customer_phone, status, type, subtotal, total, notes)
  values (v_store_id, trim(p_customer_name), nullif(trim(p_customer_email), ''), nullif(trim(p_customer_phone), ''), 'pending', p_type, v_subtotal, v_subtotal, p_notes)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into order_items (order_id, variant_id, product_name, variant_label, quantity, unit_price, total)
    values (
      v_order_id,
      (v_item->>'variant_id')::uuid,
      v_item->>'product_name',
      v_item->>'variant_label',
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric,
      (v_item->>'unit_price')::numeric * (v_item->>'quantity')::int
    );

    update inventory
      set reserved = reserved + (v_item->>'quantity')::int
      where store_id = v_store_id and variant_id = (v_item->>'variant_id')::uuid;
  end loop;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(text, text, text, text, order_type, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, order_type, text, jsonb) to anon, authenticated;

-- Store members need to confirm/cancel orders from the admin.
create or replace function public.update_order_status(
  p_order_id uuid,
  p_status   order_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id uuid;
  v_prev     order_status;
  v_item     record;
begin
  select store_id, status into v_store_id, v_prev from orders where id = p_order_id;
  if v_store_id is null then
    raise exception 'Pedido não encontrado';
  end if;
  if not is_store_member(v_store_id) then
    raise exception 'Sem permissão';
  end if;

  -- releasing (cancel) frees the reserved stock back
  if p_status = 'cancelled' and v_prev <> 'cancelled' then
    for v_item in select variant_id, quantity from order_items where order_id = p_order_id loop
      update inventory set reserved = greatest(0, reserved - v_item.quantity)
        where store_id = v_store_id and variant_id = v_item.variant_id;
    end loop;
  end if;

  update orders set status = p_status where id = p_order_id;
end;
$$;

revoke all on function public.update_order_status(uuid, order_status) from public;
grant execute on function public.update_order_status(uuid, order_status) to authenticated;
