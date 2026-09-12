-- profiles-er purno rup: department, batch, desh, career,
-- bio, privacy switch, trust fields, ar search-column.

ALTER TABLE profiles
  ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN graduation_year INT,
  ADD COLUMN current_designation TEXT,
  ADD COLUMN current_company TEXT,
  ADD COLUMN linkedin_url TEXT,
  ADD COLUMN bio TEXT,
  ADD COLUMN is_public BOOLEAN DEFAULT true,
  ADD COLUMN role TEXT
    CHECK (role IN ('super_admin', 'admin', 'contributor', 'alumni'))
    DEFAULT 'alumni',
  ADD COLUMN is_permanent BOOLEAN DEFAULT false,
  ADD COLUMN is_verified BOOLEAN DEFAULT false,
  ADD COLUMN status TEXT
    CHECK (status IN ('current_student', 'alumnus'))
    DEFAULT 'alumnus',
  ADD COLUMN current_country TEXT DEFAULT 'Bangladesh',
  ADD COLUMN higher_study_institution TEXT,
  ADD COLUMN higher_study_program TEXT,
  ADD COLUMN deleted_at TIMESTAMPTZ;

-- Search column — sob somoy nije theke name/company/
-- designation/bio theke toiri hoy (hate kore update kora
-- lagbe na)
ALTER TABLE profiles
  ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(full_name, '') || ' ' ||
      coalesce(current_company, '') || ' ' ||
      coalesce(current_designation, '') || ' ' ||
      coalesce(bio, ''))
  ) STORED;

-- Indexes — directory/search jore hater moto cholar jonno
CREATE INDEX ON profiles (department_id);
CREATE INDEX ON profiles (graduation_year);
CREATE INDEX ON profiles (status);
CREATE INDEX profiles_public_idx ON profiles (is_public) WHERE is_public;
CREATE INDEX ON profiles (current_country);
CREATE INDEX profiles_search_idx ON profiles USING GIN (search_vector);

-- Typo-tolerant naam search (spelling bhul holeo pabe)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX profiles_name_trgm ON profiles USING gin (full_name gin_trgm_ops);

-- Select-tala update: public profile sobai dekhbe,
-- private profile shudhu malik
DROP POLICY "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT
  USING (is_public = true OR id = auth.uid());