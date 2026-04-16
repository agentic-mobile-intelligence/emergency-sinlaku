-- Add hidden_from_map flag to organizations
-- Allows admins to suppress an org from the public map view without deleting it
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hidden_from_map boolean NOT NULL DEFAULT false;
