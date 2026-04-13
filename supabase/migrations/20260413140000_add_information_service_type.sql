-- Add 'information' as a service_type for weather advisories, public notices, and info resources
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'information';
