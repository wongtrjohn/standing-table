-- Favourites feature — Supabase schema changes
-- ===========================================================================
-- Run this in the Supabase SQL editor BEFORE deploying the favourites build.
-- The frontend writes a `fav` field on places; without the column below,
-- saving a place would fail. This script is idempotent — safe to re-run.

-- 1) Personal favourites ----------------------------------------------------
-- A simple flag on your own places. Floats favourited spots to the top of
-- each lane/list and powers the "Favourites" filter on the map.
alter table public.places
  add column if not exists fav boolean not null default false;

-- 2) Shared-list favourites -------------------------------------------------
-- Per-member, exactly like verdicts (shared_reviews): each person stars their
-- own favourites in a shared list and sees their own stars rise to the top.
create table if not exists public.shared_favourites (
  place_id   uuid not null references public.shared_places(id) on delete cascade,
  user_id    uuid not null references auth.users(id)          on delete cascade,
  created_at timestamptz not null default now(),
  primary key (place_id, user_id)
);

alter table public.shared_favourites enable row level security;

-- Members of a table can READ every favourite on its places (so the app can
-- show a per-place favourite count and rank the most-loved spots to the top)...
drop policy if exists "shared_favourites_select_own" on public.shared_favourites;
drop policy if exists "shared_favourites_select_members" on public.shared_favourites;
create policy "shared_favourites_select_members" on public.shared_favourites
  for select using (
    exists (
      select 1
      from public.shared_places sp
      join public.shared_table_members m on m.table_id = sp.table_id
      where sp.id = shared_favourites.place_id
        and m.user_id = auth.uid()
    )
  );

-- ...but each member may only ADD or REMOVE their OWN favourites.
drop policy if exists "shared_favourites_insert_own" on public.shared_favourites;
create policy "shared_favourites_insert_own" on public.shared_favourites
  for insert with check (user_id = auth.uid());

drop policy if exists "shared_favourites_delete_own" on public.shared_favourites;
create policy "shared_favourites_delete_own" on public.shared_favourites
  for delete using (user_id = auth.uid());
