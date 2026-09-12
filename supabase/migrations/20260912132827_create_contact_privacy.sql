-- Email/phone er alada ghor. Malik chara keu ei table-e
-- sorasori dhukle RLS age-i atkai dibe (default deny).
CREATE TABLE profile_contacts (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone_number TEXT,
  phone_visibility TEXT
    CHECK (phone_visibility IN ('public', 'members_only', 'private'))
    DEFAULT 'private',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profile_contacts ENABLE ROW LEVEL SECURITY;

-- Malik nijer puro row dekhte/edit korte parbe
CREATE POLICY "contacts_owner_all" ON profile_contacts
  FOR ALL USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- "Dorshok-choshma" (VIEW) — baki sobai ei diye dekhe:
--   email → sob shomoy (public by design)
--   phone → 'public' = sobai | 'members_only' = shudhu
--           login-kora keu | 'private' = keu na
CREATE VIEW public_contact_info WITH (security_invoker = true) AS
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

-- Ekhon-je user-der ache, tader email ei notun ghore
-- boshiye deya (auth theke niye asha)
INSERT INTO profile_contacts (profile_id, email)
SELECT u.id, u.email
FROM auth.users u
ON CONFLICT (profile_id) DO NOTHING;