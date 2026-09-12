-- Amantron-potro: token hash kore rakhay (raw token kokhono
-- DB-te thake na), 14 din por ochol, ekbar-i byabohar
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT UNIQUE NOT NULL,
  invited_email TEXT,
  faculty_id UUID REFERENCES faculties(id),
  department_id UUID REFERENCES departments(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '14 days',
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- "Verify koro" onurodh
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  evidence_note TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Obhijog
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id),
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'dismissed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Opuruddhi-khata: ekbar lekha, kokhono muchha/bodlano
-- jabe na (UPDATE/DELETE policy-i nei)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Talasobdo:

-- invites: kono user policy NAI — mane user keu ei table-e
-- chhara kortei parbe na. Shudhu server-side admin route
-- (service_role — ja RLS bypass kore) chalate parbe.
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- verification: nijer request postte/dekhte pare —
-- kintu status dhuke pare shudhu 'pending' hisebe;
-- approved/reject shudhu admin server route
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_own_select" ON verification_requests
  FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "verification_own_insert" ON verification_requests
  FOR INSERT
  WITH CHECK (profile_id = auth.uid() AND status = 'pending');

-- reports: je kono login-kora user obhijog pathate pare
-- (shudhu 'pending' obosthay), nijer ta dekhte pare
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_own_select" ON reports
  FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY "reports_own_insert" ON reports
  FOR INSERT
  WITH CHECK (reporter_id = auth.uid() AND status = 'pending');

-- audit_log: porar adhikar SHUDHU tumi (permanent
-- super_admin); lekha shudhu server route; muchha kokhono na
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_superadmin_select" ON audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
        AND p.is_permanent = true
    )
  );