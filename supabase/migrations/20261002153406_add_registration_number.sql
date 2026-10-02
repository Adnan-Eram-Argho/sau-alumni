-- Registration number: publicly visible, signup-e mandatory.
-- NOTE: SQL-ta agey SQL Editor-e chola hoyechhilo; ei file
-- migration history thik korar jonno. IF NOT EXISTS r karone
-- already-ase jaygay chole abar chole — dui-i khetre safe.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registration_number text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_registration_number_unique_idx
ON profiles (registration_number)
WHERE registration_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_registration_number_idx
ON profiles (registration_number);