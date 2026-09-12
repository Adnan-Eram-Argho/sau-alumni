-- Fix: permanent super_admin NIJER naam/bio/department edit
-- korte parbe — kintu privilege (role, is_permanent, is_verified)
-- oboshoi frozen thakbe. Ager version sob-i block kore dilo.

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
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_permanent IS DISTINCT FROM OLD.is_permanent
       OR NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
      RAISE EXCEPTION 'Permanent admin privileges are locked';
    END IF;
    -- Privilege bodlachhe na — normal edit thik ache.
    -- (RLS sudhu malik-i ei row chhurate dey, tai safe.)
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