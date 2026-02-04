-- Remove price column from recipes table
ALTER TABLE "public"."recipes"
  DROP COLUMN IF EXISTS price;
