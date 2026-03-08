-- Migration to add latitude and longitude to quests table

ALTER TABLE public.quests ADD COLUMN latitude double precision;
ALTER TABLE public.quests ADD COLUMN longitude double precision;
ALTER TABLE public.quests ALTER COLUMN building_zone_id DROP NOT NULL;

-- Ensure that either building_zone_id is provided, OR (latitude and longitude) are provided.
ALTER TABLE public.quests ADD CONSTRAINT require_location CHECK (
    building_zone_id IS NOT NULL OR (latitude IS NOT NULL AND longitude IS NOT NULL)
);
