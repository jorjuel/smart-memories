insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('promotion-pdfs', 'promotion-pdfs', false, 4194304, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 4194304,
  allowed_mime_types = array['application/pdf'];

create policy "Private promotion PDFs" on storage.objects
  as restrictive for all to anon, authenticated
  using (bucket_id <> 'promotion-pdfs')
  with check (bucket_id <> 'promotion-pdfs');
