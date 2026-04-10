
--
-- Add Group for District Management
--

-- 1) Add the column
ALTER TABLE shared."District"
ADD COLUMN IF NOT EXISTS "group" text;

-- 2) Update values using mapping
UPDATE shared."District" AS d
SET "group" = m."group"
FROM (
  VALUES
    (1,  'Central / Town'),
    (2,  'Central / Town'),
    (3,  'Central / Town'),
    (4,  'Central / Town'),
    (5,  'Central West'),
    (6,  'Central / Town'),
    (7,  'Central / Town'),
    (8,  'Central / Town'),
    (9,  'Central / Town'),
    (10, 'Central North'),
    (11, 'Central North'),
    (12, 'Central North'),
    (13, 'Central East'),
    (14, 'Central East'),
    (15, 'Central East'),
    (16, 'East'),
    (17, 'East'),
    (18, 'East'),
    (19, 'North East'),
    (20, 'North Central'),
    (21, 'North Central'),
    (22, 'West'),
    (23, 'North Central'),
    (24, 'West'),
    (25, 'North'),
    (26, 'North'),
    (27, 'North'),
    (28, 'North')
) AS m("postalDistrict", "group")
WHERE NULLIF(trim(d."postalDistrict"), '')::int = m."postalDistrict";

