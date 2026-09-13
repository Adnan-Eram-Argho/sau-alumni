-- SAU-r asol faculty + department list (spec: kono nam
-- code-e hardcode na — sob ekhane, poree bar bar bar bar
-- add kora jay)
-- ⚠️ NOTE: sau.edu.bd-r sathe mile neo — bhul/bad-pora
-- thakle push korar AGEY thik kore nio.

insert into faculties (name, slug, code) values
  ('Agriculture', 'agriculture', 'AG'),
  ('Agribusiness Management', 'agribusiness-management', 'ABM'),
  ('Fisheries', 'fisheries', 'FIS'),
  ('Animal Science and Veterinary Medicine', 'animal-science-and-veterinary-medicine', 'ASVM')
on conflict (slug) do nothing;

insert into departments (faculty_id, name, slug)
select f.id, d.name, d.slug
from (values
  ('agriculture', 'Agronomy', 'agronomy'),
  ('agriculture', 'Agricultural Botany', 'agricultural-botany'),
  ('agriculture', 'Agricultural Chemistry', 'agricultural-chemistry'),
  ('agriculture', 'Agricultural Extension', 'agricultural-extension'),
  ('agriculture', 'Biochemistry', 'biochemistry'),
  ('agriculture', 'Entomology', 'entomology'),
  ('agriculture', 'Genetics and Plant Breeding', 'genetics-and-plant-breeding'),
  ('agriculture', 'Horticulture', 'horticulture'),
  ('agriculture', 'Plant Pathology', 'plant-pathology'),
  ('agriculture', 'Soil Science', 'soil-science'),
  ('agribusiness-management', 'Agricultural Economics', 'agricultural-economics'),
  ('agribusiness-management', 'Agricultural Statistics', 'agricultural-statistics'),
  ('fisheries', 'Aquaculture', 'aquaculture'),
  ('fisheries', 'Fisheries Biology and Genetics', 'fisheries-biology-and-genetics'),
  ('fisheries', 'Fisheries Resources Management', 'fisheries-resources-management'),
  ('fisheries', 'Marine Fisheries and Technology', 'marine-fisheries-and-technology'),
  ('animal-science-and-veterinary-medicine', 'Animal Nutrition', 'animal-nutrition'),
  ('animal-science-and-veterinary-medicine', 'Animal Breeding and Genetics', 'animal-breeding-and-genetics'),
  ('animal-science-and-veterinary-medicine', 'Anatomy and Physiology', 'anatomy-and-physiology'),
  ('animal-science-and-veterinary-medicine', 'Poultry Science', 'poultry-science'),
  ('animal-science-and-veterinary-medicine', 'Dairy Science', 'dairy-science')
) as d(faculty_slug, name, slug)
join faculties f on f.slug = d.faculty_slug
on conflict (slug) do nothing;