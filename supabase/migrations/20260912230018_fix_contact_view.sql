-- BUG FIX: ager view-e "security_invoker" chhilo — er karone
-- view ta invoking user-er RLS-e chhito, ar profile_contacts-er
-- "shudhu-malik" tala onno sob user-er contact row kete dil
-- (email-o). 
--
-- Notun design: view ta ghorer malik (postgres) er privilege-e
-- chalbe — view-er NIJER logic (public profile + phone
-- visibility) ek-matra niyom. Raw table RLS-e talabondho-i.

DROP VIEW IF EXISTS public_contact_info;

CREATE VIEW public_contact_info AS
SELECT
  pc.profile_id,
  pc.email,
  CASE
    WHEN pc.phone_visibility = 'public' THEN pc.phone_number
    WHEN pc.phone_visibility = 'members_only' AND auth.uid() IS NOT NULL
      THEN pc.phone_number
    ELSE NULL
  END AS phone_number
FROM profile_contacts pc
JOIN profiles p ON p.id = pc.profile_id
WHERE p.is_public = true OR pc.profile_id = auth.uid();

GRANT SELECT ON public_contact_info TO anon, authenticated;