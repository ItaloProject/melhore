-- Adds support for deleting existing variants from upsert_product(). A
-- variant can't be hard-deleted if it already has sale_items/order_items
-- referencing it (no ON DELETE CASCADE there, by design — sales history
-- must stay intact) so deletion is best-effort: variants with history are
-- skipped and reported back to the caller instead of failing the whole save.
-- Return type changes from uuid to jsonb, so the old signature must be
-- dropped first.

drop function if exists public.upsert_product(uuid, uuid, text, text, text, numeric, numeric, text[], boolean, jsonb);

create or replace function public.upsert_product(
  p_store_id             uuid,
  p_product_id           uuid,   -- null to create
  p_name                 text,
  p_description          text,
  p_category_name        text,
  p_price                numeric,
  p_compare_price        numeric,
  p_images               text[],
  p_active               boolean,
  p_variants             jsonb,  -- [{id?, size?, color?, color_hex?, price_override?, quantity, min_quantity}]
  p_deleted_variant_ids  uuid[] default '{}'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id  uuid;
  v_category_id uuid;
  v_variant     jsonb;
  v_variant_id  uuid;
  v_delete_id   uuid;
  v_has_history boolean;
  v_skipped     text[] := '{}';
  v_label       text;
begin
  if not is_store_member(p_store_id) then
    raise exception 'Sem permissão';
  end if;

  if p_name is null or trim(p_name) = '' then
    raise exception 'Nome do produto é obrigatório';
  end if;

  if p_category_name is not null and trim(p_category_name) <> '' then
    select id into v_category_id from categories
      where store_id = p_store_id and lower(name) = lower(trim(p_category_name));
    if v_category_id is null then
      insert into categories (store_id, name, slug)
      values (p_store_id, trim(p_category_name), regexp_replace(lower(trim(p_category_name)), '[^a-z0-9]+', '-', 'g'))
      returning id into v_category_id;
    end if;
  end if;

  if p_product_id is null then
    insert into products (store_id, category_id, name, description, price, compare_price, images, active)
    values (p_store_id, v_category_id, trim(p_name), nullif(trim(coalesce(p_description, '')), ''), p_price, p_compare_price, coalesce(p_images, '{}'), p_active)
    returning id into v_product_id;
  else
    update products set
      category_id   = v_category_id,
      name          = trim(p_name),
      description   = nullif(trim(coalesce(p_description, '')), ''),
      price         = p_price,
      compare_price = p_compare_price,
      images        = coalesce(p_images, '{}'),
      active        = p_active
    where id = p_product_id and store_id = p_store_id
    returning id into v_product_id;

    if v_product_id is null then
      raise exception 'Produto não encontrado';
    end if;
  end if;

  -- best-effort delete of removed variants
  foreach v_delete_id in array coalesce(p_deleted_variant_ids, '{}') loop
    select exists(select 1 from sale_items where variant_id = v_delete_id)
        or exists(select 1 from order_items where variant_id = v_delete_id)
      into v_has_history;

    if v_has_history then
      select coalesce(size, '') || case when color is not null then ' / ' || color else '' end
        into v_label
        from product_variants where id = v_delete_id;
      v_skipped := array_append(v_skipped, coalesce(nullif(v_label, ''), 'variação'));
    else
      delete from product_variants where id = v_delete_id and product_id = v_product_id;
    end if;
  end loop;

  for v_variant in select * from jsonb_array_elements(coalesce(p_variants, '[]'::jsonb)) loop
    if coalesce(v_variant->>'id', '') <> '' then
      v_variant_id := (v_variant->>'id')::uuid;
      update product_variants set
        size           = nullif(v_variant->>'size', ''),
        color          = nullif(v_variant->>'color', ''),
        color_hex      = nullif(v_variant->>'color_hex', ''),
        price_override = case when coalesce(v_variant->>'price_override', '') = '' then null else (v_variant->>'price_override')::numeric end
      where id = v_variant_id and product_id = v_product_id;
    else
      insert into product_variants (product_id, size, color, color_hex, price_override)
      values (
        v_product_id,
        nullif(v_variant->>'size', ''),
        nullif(v_variant->>'color', ''),
        nullif(v_variant->>'color_hex', ''),
        case when coalesce(v_variant->>'price_override', '') = '' then null else (v_variant->>'price_override')::numeric end
      )
      returning id into v_variant_id;
    end if;

    insert into inventory (store_id, variant_id, quantity, min_quantity)
    values (p_store_id, v_variant_id, coalesce((v_variant->>'quantity')::int, 0), coalesce((v_variant->>'min_quantity')::int, 3))
    on conflict (store_id, variant_id) do update
      set quantity = excluded.quantity, min_quantity = excluded.min_quantity;
  end loop;

  return jsonb_build_object('product_id', v_product_id, 'skipped_deletions', to_jsonb(v_skipped));
end;
$$;

revoke all on function public.upsert_product(uuid, uuid, text, text, text, numeric, numeric, text[], boolean, jsonb, uuid[]) from public;
grant execute on function public.upsert_product(uuid, uuid, text, text, text, numeric, numeric, text[], boolean, jsonb, uuid[]) to authenticated;
