-- FIX: admin ra browser theke-i carousel chobi-er ROW
-- insert korte parbe. Ager design-e shudhu service-role
-- dhora hoyechhilo — kintu upload flow browser theke
-- chholar jonno table-eo admin-der nijer JWT-r dorja lagbe.
-- (Storage bucket-e ei dorja AGE thekei chhilo; ekhon
-- table-eo same rokko: shudhu admin role.)

create policy "homepage_images_admin_insert" on homepage_images
  for insert to authenticated
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
        and p.deleted_at is null
    )
  );