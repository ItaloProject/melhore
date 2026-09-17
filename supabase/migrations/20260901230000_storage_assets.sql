-- Public storage bucket for store-owned assets (logo, banner, product images).
-- Path convention: {store_id}/<file>, so RLS can scope writes per store
-- using storage.foldername(name)[1] as the store_id.

insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do nothing;

drop policy if exists "public_read_store_assets" on storage.objects;
create policy "public_read_store_assets"
  on storage.objects for select
  using (bucket_id = 'store-assets');

drop policy if exists "store_members_insert_assets" on storage.objects;
create policy "store_members_insert_assets"
  on storage.objects for insert
  with check (
    bucket_id = 'store-assets'
    and is_store_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "store_members_update_assets" on storage.objects;
create policy "store_members_update_assets"
  on storage.objects for update
  using (
    bucket_id = 'store-assets'
    and is_store_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "store_members_delete_assets" on storage.objects;
create policy "store_members_delete_assets"
  on storage.objects for delete
  using (
    bucket_id = 'store-assets'
    and is_store_member((storage.foldername(name))[1]::uuid)
  );
