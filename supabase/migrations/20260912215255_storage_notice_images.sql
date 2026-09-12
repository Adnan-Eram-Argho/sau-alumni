-- Notice-image-der bucket: public read, 5MB cap,
-- MIME allowlist (SVG KOXONO na — XSS vector, spec Section 4)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'notice-images',
  'notice-images',
  true,
  5242880, -- 5MB (bytes-e)
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Upload shudhu contributor/admin/super_admin (storage-RLS)
create policy "notice_images_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'notice-images'
  and exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and p.role in ('contributor', 'admin', 'super_admin')
      and p.deleted_at is null
  )
);