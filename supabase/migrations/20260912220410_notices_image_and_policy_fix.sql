-- 1) Notice-e optional chobi (image upload feature)
alter table notices add column image_url text;

-- 2) Security fix: insert shudhu DRAFT hisebe —
--    publish shudhu admin API diye (spec). Ager
--    policy-te keu sorasori 'published' likhe dite parto!
drop policy "notices_insert" on notices;

create policy "notices_insert" on notices
  for insert
  with check (author_id = auth.uid() and status = 'draft');