-- Faculty ar department — SAU-er academic kathamo.
-- Kono kichhu hardcode na — ekhane notun row dhukle
-- (Phase 5-e admin route diye) site-e nije-i dekha jabe.

CREATE TABLE faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES faculties(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tala (RLS): SOBAI padte pare (public read — dropdown/
-- filter/SEO page lagbe), kintu KEU likhte pare na.
-- (v6 fix: ei duita table-r policy age chilo-i na —
-- tobe default deny hoye directory bhenge jeto)
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faculties_public_read" ON faculties
  FOR SELECT USING (true);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "departments_public_read" ON departments
  FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE policy niberly nei = lekha bondho.
-- Shudhu Phase 5-er server-side admin route (service_role)
-- ei table-e notun faculty/department add korte parbe.

-- Pilot seed:
INSERT INTO faculties (name, slug, code) VALUES
  ('Agribusiness Management', 'agribusiness-management', 'ABM');

INSERT INTO departments (faculty_id, name, slug)
SELECT f.id, 'Agricultural Economics', 'agricultural-economics'
FROM faculties f
WHERE f.slug = 'agribusiness-management';