-- Avatar bucket: public read, 2MB, image MIME
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Prottek user SHUDHU nijer folder-e upload korte parbe
create policy "avatars_upload_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Nijer folder theke DELETE-o parbe (pic remove/change er jonno)
create policy "avatars_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Notice-image-o same: uploader nijer file delete korte parbe
create policy "notice_images_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'notice-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);