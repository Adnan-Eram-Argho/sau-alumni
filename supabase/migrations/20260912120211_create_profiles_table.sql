-- "profiles" table: protyek user-er ekta row.
-- Nam, department, batch — sob ekhan-e thakbe
-- (boro version Phase 2-e ashbe).

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS ON = table-e tala. Rule gulai bole ke ki pabe.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Rule 1: user nijer row dekhte parbe
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT
  USING (id = auth.uid());

-- Rule 2: login kora user nijer row insert korte parbe
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Rule 3: user nijer row edit korte parbe
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- DELETE-r kono rule nei — mane kew nijer account
-- hard-delete korte parbe na (iccha-krita, spec onujayi)