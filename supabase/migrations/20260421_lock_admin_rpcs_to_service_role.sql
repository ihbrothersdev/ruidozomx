-- Lock cassette/song mutation RPCs to `service_role` only.
--
-- Rationale: these RPCs mutate cassette lifecycle / song positions and are
-- exclusively invoked from admin server actions (`app/admin/actions.ts`),
-- which always call `requireAdmin()` before reaching for the service-role
-- supabase client.
--
-- Granting them to `authenticated` / `anon` would let any user with the
-- public anon key call them directly via PostgREST and bypass the
-- server-side admin gate.

revoke all on function public.set_next_cassette(uuid)             from public, anon, authenticated;
revoke all on function public.publish_cassette(uuid)              from public, anon, authenticated;
revoke all on function public.reorder_cassette_songs(uuid, jsonb) from public, anon, authenticated;

grant execute on function public.set_next_cassette(uuid)             to service_role;
grant execute on function public.publish_cassette(uuid)              to service_role;
grant execute on function public.reorder_cassette_songs(uuid, jsonb) to service_role;
