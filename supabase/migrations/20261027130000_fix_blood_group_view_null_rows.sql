-- Members view-te missing blood-group row-o profile id soho unknown dekhay.
CREATE OR REPLACE VIEW members_only_blood_groups AS
SELECT target.id AS profile_id, bg.blood_group
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
