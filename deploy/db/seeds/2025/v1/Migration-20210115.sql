--
-- Add additional column contact person to client
--

ALTER TABLE wellac."Client"
ADD COLUMN "thirdContactPerson" VARCHAR(255),
ADD COLUMN "thirdContactNumber" VARCHAR(255),
ADD COLUMN "thirdContactEmail" VARCHAR(255),
ADD COLUMN "fourthContactPerson" VARCHAR(255),
ADD COLUMN "fourthContactNumber" VARCHAR(255),
ADD COLUMN "fourthContactEmail" VARCHAR(255);