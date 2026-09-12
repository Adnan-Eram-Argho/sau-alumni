-- Notice board
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id),
  faculty_id UUID REFERENCES faculties(id),
  department_id UUID REFERENCES departments(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  pinned BOOLEAN DEFAULT false,
  publish_at TIMESTAMPTZ,        -- scheduled publish
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ke kon notice porteche — unread badge er jonno
CREATE TABLE notice_reads (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notice_id UUID REFERENCES notices(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, notice_id)
);

-- Job board (is_featured = bhobishyote monetization-ready)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by UUID REFERENCES profiles(id),
  target_faculty_id UUID REFERENCES faculties(id),
  title TEXT NOT NULL,
  company_name TEXT,
  location TEXT,
  job_type VARCHAR(50),
  application_url_or_email TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'active', 'archived')) DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX ON notices (status, created_at DESC);
CREATE INDEX ON notices (faculty_id);
CREATE INDEX ON notice_reads (notice_id);
CREATE INDEX ON jobs (status, created_at DESC);

-- Talasobdo:
-- Notice: published sobai dekhe; draft shudhu likhok nijei.
-- Insert parbe (draft hisebe) — kintu publish/update shudhu
-- Phase 5/6-er server-side admin route diye hobe.
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notices_select" ON notices
  FOR SELECT
  USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "notices_insert" ON notices
  FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Ke porteche — shudhu nijer read-record
ALTER TABLE notice_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notice_reads_own" ON notice_reads
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Job: active sobai dekhe; pending/posted shudhu poster nijei.
-- Je kono login-kora user submit korte pare (pending) —
-- approve/feature shudhu server-side admin route diye.
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_select" ON jobs
  FOR SELECT
  USING (status = 'active' OR posted_by = auth.uid());

CREATE POLICY "jobs_insert" ON jobs
  FOR INSERT
  WITH CHECK (posted_by = auth.uid());