-- Hide members-only phone numbers from suspended callers while preserving
-- access to each user's own contact row.
DROP VIEW IF EXISTS public_contact_info;

CREATE VIEW public_contact_info AS
SELECT
  pc.profile_id,
  pc.email,
  CASE
    WHEN pc.phone_visibility = 'public' THEN pc.phone_number
    WHEN pc.phone_visibility = 'members_only'
     AND auth.uid() IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM profiles caller
       WHERE caller.id = auth.uid()
         AND caller.deleted_at IS NOT NULL
     )
      THEN pc.phone_number
    ELSE NULL
  END AS phone_number
FROM profile_contacts pc
JOIN profiles p ON p.id = pc.profile_id
WHERE (p.is_public = true AND p.deleted_at IS NULL)
   OR pc.profile_id = auth.uid();

GRANT SELECT ON public_contact_info TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
