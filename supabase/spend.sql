-- Per-diner spend on shared-list verdicts — Supabase schema changes
-- ===========================================================================
-- Run this in the Supabase SQL editor BEFORE deploying the shared-spend build.
-- The personal journal already records exact amount spent + party size on each
-- place; this adds the same to a member's verdict on a shared list, so everyone
-- can log what they paid and the app can show price-per-person. Each verdict is
-- per-member (shared_reviews), so the spend is per-member too. Idempotent.

alter table public.shared_reviews
  add column if not exists spent  numeric,
  add column if not exists people integer;
