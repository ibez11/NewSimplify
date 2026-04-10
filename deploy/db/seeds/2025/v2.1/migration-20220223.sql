--
-- Add New Column contact number to Shared.user
--

ALTER TABLE shared."User" ADD COLUMN "contactNumber" varchar(255);