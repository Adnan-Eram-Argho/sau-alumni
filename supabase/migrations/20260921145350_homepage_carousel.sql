-- Homepage carousel chobi-der ghor + bucket.
-- Chobi na thakle homepage nijer default design dekhay —
-- kono problem-i hoy na.

create table homepage_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  sort_order int not null default 0,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table homepage_images enable row level security;

-- Public read (homepage er jonno), likha shudhu server
-- (service-role admin API) — kono user policy nei
create policy "homepage_images_public_read" on homepage_images
  for select using (true);

-- Bucket: public read, 5MB cap, image-only (SVG block)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'homepage-images',
  'homepage-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Upload shudhu admin ra (client-side upload er jonno)
create policy "homepage_images_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'homepage-images'
  and exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
      and p.deleted_at is null
  )
);