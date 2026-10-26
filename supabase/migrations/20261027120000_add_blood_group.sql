-- Blood group raw table-e owner-only thakbe, active member-ra view diye dekhbe.
CREATE TABLE profile_blood_groups (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  blood_group TEXT CHECK (
    blood_group IS NULL OR
    blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
  ),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profile_blood_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blood_groups_owner_select" ON profile_blood_groups
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "blood_groups_owner_insert" ON profile_blood_groups
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "blood_groups_owner_update" ON profile_blood_groups
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

REVOKE ALL ON TABLE profile_blood_groups FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON TABLE profile_blood_groups TO authenticated;

-- Owner-executing view-e caller ar target dujoner status check kora hoy.
CREATE VIEW members_only_blood_groups AS
SELECT bg.profile_id, bg.blood_group
FROM profiles target
LEFT JOIN profile_blood_groups bg ON bg.profile_id = target.id
WHERE auth.uid() IS NOT NULL
  AND (
    target.id = auth.uid()
    OR (
      target.is_public = true
      AND target.deleted_at IS NULL
      AND EXISTS (
        SELECT 1
        FROM profiles caller
        WHERE caller.id = auth.uid()
          AND caller.deleted_at IS NULL
      )
    )
  );

REVOKE ALL ON TABLE members_only_blood_groups FROM PUBLIC, anon;
GRANT SELECT ON TABLE members_only_blood_groups TO authenticated;

NOTIFY pgrst, 'reload schema';
