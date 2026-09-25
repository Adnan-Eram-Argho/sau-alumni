-- Phase 1 Security Hardening & Integrity Fixes

-- 1) Fix (#1 + C1): Protect profiles privilege guard against INSERT, UPDATE, and DELETE escalation
CREATE OR REPLACE FUNCTION protect_profiles_privilege()
RETURNS TRIGGER AS $$ BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (NEW.is_permanent IS TRUE
        OR NEW.role IS DISTINCT FROM 'alumni'
        OR NEW.is_verified IS TRUE)
       AND auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot self-grant elevated privileges on signup';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.is_permanent THEN
      RAISE EXCEPTION 'Permanent admin cannot be deleted';
    END IF;
    RETURN OLD;
  END IF;

  -- UPDATE:
  IF OLD.is_permanent THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_permanent IS DISTINCT FROM OLD.is_permanent
       OR NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
      RAISE EXCEPTION 'Permanent admin privileges are locked';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.is_permanent AND NOT OLD.is_permanent THEN
    RAISE EXCEPTION 'Cannot grant permanent admin status';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Role changes must go through the admin API';
  END IF;

  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Verification status must go through the admin API';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_privilege_guard ON profiles;
CREATE TRIGGER profiles_privilege_guard
BEFORE INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION protect_profiles_privilege();

-- 2) Fix (C5-part-1): public_contact_info VIEW — hide contacts of suspended users (deleted_at IS NOT NULL) without touching is_public
DROP VIEW IF EXISTS public_contact_info;

CREATE VIEW public_contact_info AS
SELECT
  pc.profile_id,
  pc.email,
  CASE
    WHEN pc.phone_visibility = 'public' THEN pc.phone_number
    WHEN pc.phone_visibility = 'members_only' AND auth.uid() IS NOT NULL THEN pc.phone_number
    ELSE NULL
  END AS phone_number
FROM profile_contacts pc
JOIN profiles p ON p.id = pc.profile_id
WHERE (p.is_public = true AND p.deleted_at IS NULL)
   OR pc.profile_id = auth.uid();

GRANT SELECT ON public_contact_info TO anon, authenticated;

-- 3) Fix (#13 + C6): Enforce user folder isolation on notice-images and homepage-images upload
DROP POLICY IF EXISTS "notice_images_upload" ON storage.objects;
CREATE POLICY "notice_images_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'notice-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('contributor', 'admin', 'super_admin')
        AND p.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "homepage_images_upload" ON storage.objects;
CREATE POLICY "homepage_images_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'homepage-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
        AND p.deleted_at IS NULL
    )
  );

-- 4) Fix (#14): Prevent duplicate pending verification requests per user
CREATE UNIQUE INDEX IF NOT EXISTS verification_requests_pending_unique_idx
ON verification_requests (profile_id)
WHERE status = 'pending';
