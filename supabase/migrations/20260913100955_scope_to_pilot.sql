-- Pilot scope: apatoto shudhu Agribusiness Management faculty +
-- Agricultural Economics department (spec-er pilot plan).
-- Baki faculty/department sob muchhi — pore notun migration
-- diye abar add kora jabe.

-- 1) Kono profile/notice jodi notun department-gulote set
--    thake — agey clear kore dei (nahole delete atke)
update profiles
set department_id = null
where department_id is not null
  and department_id not in (
    select id from departments where slug = 'agricultural-economics'
  );

update notices
set faculty_id = null
where faculty_id is not null
  and faculty_id not in (
    select id from faculties where slug = 'agribusiness-management'
  );

update notices
set department_id = null
where department_id is not null
  and department_id not in (
    select id from departments where slug = 'agricultural-economics'
  );

-- 2) Baki sob department + faculty muchhi
delete from departments
where slug <> 'agricultural-economics';

delete from faculties
where slug <> 'agribusiness-management';