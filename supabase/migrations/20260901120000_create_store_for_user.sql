-- Create a store for the signed-in user (owner) and keep phone as contact.
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

drop policy if exists "own_membership_select" on store_users;
create policy "own_membership_select"
  on store_users for select
  using (auth.uid() = user_id);

drop policy if exists "members_update_own_store" on stores;
create policy "members_update_own_store"
  on stores for update
  using (is_store_member(id));
