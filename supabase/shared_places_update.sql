-- Let any shared-table member update that table's places — Supabase RLS fix
-- ===========================================================================
-- Run this in the Supabase SQL editor.
--
-- A shared list is collaborative: everyone adds to it, and the app shows
-- "Edit details" / "Delete" on every place regardless of who added it. But if
-- the UPDATE policy on shared_places only allowed the row's creator, then
-- editing — and the "Restore missing photos" / "Fetch missing opening hours"
-- backfills — silently did nothing for a place someone else added (RLS blocks
-- the write with zero rows changed and no error).
--
-- This adds a PERMISSIVE update policy for any member of the place's table.
-- Permissive policies combine with OR, so this grants the ability alongside any
-- existing policy without having to drop it. Idempotent — safe to re-run.

drop policy if exists "shared_places_update_members" on public.shared_places;
create policy "shared_places_update_members" on public.shared_places
  for update
  using (
    exists (
      select 1
      from public.shared_table_members m
      where m.table_id = shared_places.table_id
        and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.shared_table_members m
      where m.table_id = shared_places.table_id
        and m.user_id = auth.uid()
    )
  );
