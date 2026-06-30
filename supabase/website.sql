-- Website link on places — Supabase schema changes
-- ===========================================================================
-- Run this in the Supabase SQL editor BEFORE deploying the website build.
-- Places added via Google search now carry the place's website link, and it
-- can be edited by hand on any place. Stored as text on each place, in both the
-- private journal and shared lists. Idempotent — safe to re-run.

alter table public.places
  add column if not exists website text;

alter table public.shared_places
  add column if not exists website text;
