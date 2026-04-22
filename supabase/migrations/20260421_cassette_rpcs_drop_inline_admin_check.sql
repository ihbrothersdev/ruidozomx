-- The cassette lifecycle RPCs (`set_next_cassette`, `publish_cassette`) used to
-- contain an inline admin check via `auth.uid()`. We invoke them from server
-- actions through the service-role client (where `auth.uid()` is NULL), so the
-- check always failed with `unauthorized`.
--
-- Admin authorization is enforced at the server-action layer (`requireAdmin()`
-- in app/admin/actions.ts) before these RPCs are invoked, so dropping the
-- inline check is safe.

create or replace function public.set_next_cassette(p_cassette_id uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if not exists (
    select 1 from public.cassettes
    where id = p_cassette_id and not active and not archived
  ) then
    raise exception 'cassette must be a draft (not active, not archived)';
  end if;

  update public.cassettes set is_next = false where is_next = true and id <> p_cassette_id;
  update public.cassettes set is_next = true,  updated_at = now() where id = p_cassette_id;
end;
$function$;

create or replace function public.publish_cassette(p_cassette_id uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if not exists (
    select 1 from public.cassettes
    where id = p_cassette_id and not active and not archived
  ) then
    raise exception 'cassette must be a draft (not active, not archived)';
  end if;

  update public.cassettes
     set active = false, archived = true, updated_at = now()
   where active = true;

  update public.cassettes
     set active = true, is_next = false, updated_at = now()
   where id = p_cassette_id;
end;
$function$;
