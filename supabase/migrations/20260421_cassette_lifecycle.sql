-- Cassette lifecycle: introduces "is_next" (the cassette where new accepted
-- proposals will be inserted), enforces uniqueness constraints, and adds
-- atomic helper RPCs to publish/queue cassettes.

-- 1. Flag for the "siguiente" cassette (the one being filled)
alter table public.cassettes
  add column if not exists is_next boolean not null default false;

-- 2. At most one active cassette and at most one "next" cassette at a time
create unique index if not exists one_active_cassette
  on public.cassettes (active) where active = true;

create unique index if not exists one_next_cassette
  on public.cassettes (is_next) where is_next = true;

-- 3. Each (cassette, side, position) slot is unique
create unique index if not exists songs_unique_slot
  on public.songs (cassette_id, side, position);

-- 4. Position must live in 1..13 per side
alter table public.songs drop constraint if exists songs_position_range;
alter table public.songs
  add constraint songs_position_range check (position between 1 and 13);

-- 5. Atomically publish a cassette: archive whichever was active, promote this one
create or replace function public.publish_cassette(p_cassette_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cassettes
     set active = false,
         archived = true,
         is_next = false,
         updated_at = now()
   where active = true and id <> p_cassette_id;

  update public.cassettes
     set active = true,
         archived = false,
         is_next = false,
         updated_at = now()
   where id = p_cassette_id;
end;
$$;

-- 6. Mark a cassette as "next" (cannot be the active one)
create or replace function public.set_next_cassette(p_cassette_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cassettes
     set is_next = false
   where is_next = true and id <> p_cassette_id;

  update public.cassettes
     set is_next = true,
         archived = false,
         updated_at = now()
   where id = p_cassette_id and active = false;
end;
$$;

-- 7. Unset "next" entirely
create or replace function public.clear_next_cassette()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cassettes set is_next = false where is_next = true;
end;
$$;

revoke all on function public.publish_cassette(uuid) from public;
revoke all on function public.set_next_cassette(uuid) from public;
revoke all on function public.clear_next_cassette() from public;
grant execute on function public.publish_cassette(uuid)    to authenticated;
grant execute on function public.set_next_cassette(uuid)   to authenticated;
grant execute on function public.clear_next_cassette()     to authenticated;
