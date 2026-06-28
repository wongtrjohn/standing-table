-- Opening hours (from Google Places) — Supabase schema changes
-- ===========================================================================
-- Run this in the Supabase SQL editor BEFORE deploying the opening-hours build.
-- When a place is added via the Google search flow, the app now pulls its
-- regular opening hours (weekly schedule + structured periods + the place's UTC
-- offset) so the detail screen can list hours and the app can compute whether a
-- place is open or closed right now. Stored as JSON on each place. Idempotent.

alter table public.places
  add column if not exists hours jsonb;

alter table public.shared_places
  add column if not exists hours jsonb;
