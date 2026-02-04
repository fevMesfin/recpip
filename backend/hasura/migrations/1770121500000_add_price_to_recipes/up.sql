-- Add price column to recipes table
ALTER TABLE "public"."recipes"
  ADD COLUMN IF NOT EXISTS price text;
