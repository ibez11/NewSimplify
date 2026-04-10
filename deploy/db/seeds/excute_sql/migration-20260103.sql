
--
-- Add Table for Metrix Score
--

-- 1) Add table
CREATE TABLE IF NOT EXISTS shared."DistrictMatrixScored" (
  "fromGroup" text NOT NULL,
  "toGroup" text NOT NULL,
  "proximityScore" integer NOT NULL
);


-- 2) Insert values using mapping
INSERT INTO shared."DistrictMatrixScored"
("fromGroup", "toGroup", "proximityScore")
VALUES
  ('Central / Town', 'Central / Town', 100),
  ('Central / Town', 'Central East', 85),
  ('Central / Town', 'Central North', 85),
  ('Central / Town', 'Central West', 85),
  ('Central / Town', 'North Central', 70),
  ('Central / Town', 'East', 55),
  ('Central / Town', 'North East', 55),
  ('Central / Town', 'West', 55),
  ('Central / Town', 'North', 40),

  ('Central West', 'Central West', 100),
  ('Central West', 'Central / Town', 85),
  ('Central West', 'North Central', 85),
  ('Central West', 'West', 85),
  ('Central West', 'Central North', 70),
  ('Central West', 'Central East', 55),
  ('Central West', 'North', 55),
  ('Central West', 'East', 40),
  ('Central West', 'North East', 40),

  ('Central North', 'Central North', 100),
  ('Central North', 'Central / Town', 85),
  ('Central North', 'Central West', 70),
  ('Central North', 'North Central', 85),
  ('Central North', 'Central East', 70),
  ('Central North', 'North', 70),
  ('Central North', 'East', 55),
  ('Central North', 'North East', 85),
  ('Central North', 'West', 55),

  ('Central East', 'Central East', 100),
  ('Central East', 'Central / Town', 85),
  ('Central East', 'East', 85),
  ('Central East', 'North East', 70),
  ('Central East', 'Central North', 70),
  ('Central East', 'North Central', 55),
  ('Central East', 'West', 40),
  ('Central East', 'Central West', 55),
  ('Central East', 'North', 40),

  ('East', 'East', 100),
  ('East', 'Central East', 85),
  ('East', 'North East', 70),
  ('East', 'Central / Town', 55),
  ('East', 'North Central', 55),
  ('East', 'North', 55),
  ('East', 'Central North', 55),
  ('East', 'West', 25),
  ('East', 'Central West', 40),

  ('North East', 'North East', 100),
  ('North East', 'Central East', 70),
  ('North East', 'East', 70),
  ('North East', 'Central / Town', 55),
  ('North East', 'North Central', 85),
  ('North East', 'North', 85),
  ('North East', 'Central North', 85),
  ('North East', 'Central West', 40),
  ('North East', 'West', 40),

  ('North Central', 'North Central', 100),
  ('North Central', 'Central West', 85),
  ('North Central', 'Central / Town', 70),
  ('North Central', 'Central North', 85),
  ('North Central', 'North', 85),
  ('North Central', 'Central East', 55),
  ('North Central', 'East', 55),
  ('North Central', 'North East', 85),
  ('North Central', 'West', 85),

  ('North', 'North', 100),
  ('North', 'North Central', 85),
  ('North', 'Central / Town', 40),
  ('North', 'Central West', 55),
  ('North', 'Central North', 70),
  ('North', 'Central East', 40),
  ('North', 'East', 55),
  ('North', 'North East', 85),
  ('North', 'West', 55),

  ('West', 'West', 100),
  ('West', 'Central West', 85),
  ('West', 'Central / Town', 55),
  ('West', 'North Central', 85),
  ('West', 'Central North', 55),
  ('West', 'Central East', 40),
  ('West', 'East', 25),
  ('West', 'North East', 40),
  ('West', 'North', 55);