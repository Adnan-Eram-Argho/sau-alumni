-- profiles-er "borgoman darowan". Shob attack bondho:
-- 1) permanent admin delete  2) permanent admin update
-- 3) keu nijeke permanent banano  4) user-session theke
-- role change  5) nijeke verified banano
-- (4 ar 5 shudhu server-side admin API diye cholbe)

CREATE OR REPLACE FUNCTION protect_profiles_privilege()
RETURNS TRIGGER AS $$ BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_permanent THEN
      RAISE EXCEPTION 'Permanent admin cannot be deleted';
    END IF;
    RETURN OLD;
  END IF;

  -- UPDATE:
  IF OLD.is_permanent THEN
    RAISE EXCEPTION 'Permanent admin cannot be modified';
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

CREATE TRIGGER profiles_privilege_guard
BEFORE UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION protect_profiles_privilege();