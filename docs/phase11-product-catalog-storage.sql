-- Smart Memories: public product catalogue photographs only.
-- Run once in Supabase SQL Editor before uploading via /admin/products.
-- Never store private customer or recipient media in this bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-catalog', 'product-catalog', true, 3145728, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public storage read is allowed only for product-catalog objects.
-- Write/delete happen exclusively on the server via the service role,
-- after checking a signed-in owner against ADMIN_EMAILS.
drop policy if exists "Public read product catalogue images" on storage.objects;
create policy "Public read product catalogue images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'product-catalog');
