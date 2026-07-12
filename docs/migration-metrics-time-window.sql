-- Metrics: aggregate in SQL with a time window, instead of pulling raw
-- song_events into JS.
--
-- The admin metrics page used to `select` song_events and aggregate in the
-- Node layer so it could apply an arbitrary time window (the pre-existing
-- `song_metrics` / `cassette_metrics` RPCs had no `p_since`). But PostgREST caps
-- an un-paginated select at 1000 rows, and those 1000 are the OLDEST events —
-- so the newest cassette fell entirely outside the window and showed all zeros.
--
-- Fix: give the two RPCs a `p_since` parameter (filtering song_events in SQL,
-- where there is no 1000-row cap) and add a daily-series RPC for the chart.
-- The cassette/song lists still come from their base tables via LEFT JOIN, so
-- rows with no events in the window correctly show 0 rather than disappearing.

drop function if exists public.cassette_metrics(uuid);

create or replace function public.cassette_metrics(
  p_since timestamptz default null,
  p_cassette_id uuid default null
)
returns table(
  cassette_id uuid, cassette_name text, active boolean, archived boolean, is_next boolean,
  sessions_started bigint, sessions_finished bigint, unique_session_users bigint,
  unique_anon_sessions bigint, total_plays bigint, total_completes bigint
)
language sql
stable security definer
set search_path to 'public'
as $function$
  with sess_starts as (
    select cassette_id, user_id, session_id
    from public.song_events
    where type = 'cassette_session_start'
      and (p_since is null or created_at >= p_since)
      and (p_cassette_id is null or cassette_id = p_cassette_id)
  ),
  sess_ends as (
    select cassette_id, count(*) as c
    from public.song_events
    where type = 'cassette_session_end'
      and (p_since is null or created_at >= p_since)
      and (p_cassette_id is null or cassette_id = p_cassette_id)
    group by cassette_id
  ),
  plays as (
    select cassette_id, count(*) as c
    from public.song_events
    where type = 'play_start'
      and (p_since is null or created_at >= p_since)
      and (p_cassette_id is null or cassette_id = p_cassette_id)
    group by cassette_id
  ),
  comps as (
    select cassette_id, count(*) as c
    from public.song_events
    where type = 'play_complete'
      and (p_since is null or created_at >= p_since)
      and (p_cassette_id is null or cassette_id = p_cassette_id)
    group by cassette_id
  )
  select
    c.id as cassette_id,
    c.name as cassette_name,
    c.active,
    c.archived,
    c.is_next,
    coalesce(count(sess_starts.cassette_id), 0) as sessions_started,
    coalesce(se.c, 0) as sessions_finished,
    coalesce(count(distinct sess_starts.user_id) filter (where sess_starts.user_id is not null), 0) as unique_session_users,
    coalesce(count(distinct sess_starts.session_id) filter (where sess_starts.user_id is null and sess_starts.session_id is not null), 0) as unique_anon_sessions,
    coalesce(p.c, 0) as total_plays,
    coalesce(cmp.c, 0) as total_completes
  from public.cassettes c
  left join sess_starts on sess_starts.cassette_id = c.id
  left join sess_ends se on se.cassette_id = c.id
  left join plays p on p.cassette_id = c.id
  left join comps cmp on cmp.cassette_id = c.id
  where (p_cassette_id is null or c.id = p_cassette_id)
  group by c.id, c.name, c.active, c.archived, c.is_next, se.c, p.c, cmp.c
  order by c.active desc, c.is_next desc, c.created_at desc;
$function$;

drop function if exists public.song_metrics(uuid);

create or replace function public.song_metrics(
  p_since timestamptz default null,
  p_cassette_id uuid default null
)
returns table(
  song_id uuid, title text, artist text, side cassette_side, track_position integer,
  cassette_id uuid, cassette_name text, plays_total bigint, plays_authenticated bigint,
  unique_listeners bigint, unique_anon_sessions bigint, completes bigint, completion_rate numeric,
  profile_clicks bigint, interest_clicks bigint, share_clicks bigint
)
language sql
stable security definer
set search_path to 'public'
as $function$
  with starts as (
    select song_id, user_id, session_id
    from public.song_events
    where type = 'play_start'
      and (p_since is null or created_at >= p_since)
      and (p_cassette_id is null or cassette_id = p_cassette_id)
  ),
  comp_counts as (
    select song_id, count(*) as c
    from public.song_events
    where type = 'play_complete'
      and (p_since is null or created_at >= p_since)
      and (p_cassette_id is null or cassette_id = p_cassette_id)
    group by song_id
  ),
  pc_counts as (
    select song_id, count(*) as c
    from public.song_events
    where type = 'profile_click'
      and (p_since is null or created_at >= p_since)
      and (p_cassette_id is null or cassette_id = p_cassette_id)
    group by song_id
  ),
  ic_counts as (
    select song_id, count(*) as c
    from public.song_events
    where type = 'interest_click'
      and (p_since is null or created_at >= p_since)
      and (p_cassette_id is null or cassette_id = p_cassette_id)
    group by song_id
  ),
  sc_counts as (
    select song_id, count(*) as c
    from public.song_events
    where type = 'share_click'
      and (p_since is null or created_at >= p_since)
      and (p_cassette_id is null or cassette_id = p_cassette_id)
    group by song_id
  )
  select
    s.id as song_id,
    s.title,
    s.artist,
    s.side,
    s.position as track_position,
    s.cassette_id,
    c.name as cassette_name,
    coalesce(count(starts.song_id) filter (where starts.song_id is not null), 0) as plays_total,
    coalesce(count(starts.song_id) filter (where starts.user_id is not null), 0) as plays_authenticated,
    coalesce(count(distinct starts.user_id) filter (where starts.user_id is not null), 0) as unique_listeners,
    coalesce(count(distinct starts.session_id) filter (where starts.user_id is null and starts.session_id is not null), 0) as unique_anon_sessions,
    coalesce(comp.c, 0) as completes,
    case when count(starts.song_id) > 0
      then round((coalesce(comp.c, 0)::numeric / count(starts.song_id)) * 100, 1)
      else 0
    end as completion_rate,
    coalesce(pc.c, 0) as profile_clicks,
    coalesce(ic.c, 0) as interest_clicks,
    coalesce(sc.c, 0) as share_clicks
  from public.songs s
  left join public.cassettes c on c.id = s.cassette_id
  left join starts on starts.song_id = s.id
  left join comp_counts comp on comp.song_id = s.id
  left join pc_counts pc on pc.song_id = s.id
  left join ic_counts ic on ic.song_id = s.id
  left join sc_counts sc on sc.song_id = s.id
  where (p_cassette_id is null or s.cassette_id = p_cassette_id)
  group by s.id, s.title, s.artist, s.side, s.position, s.cassette_id, c.name, comp.c, pc.c, ic.c, sc.c
  order by plays_total desc;
$function$;

-- Daily series for the temporal chart. Backfills empty days in SQL so the
-- x-axis stays continuous. Buckets on the UTC calendar day to match how the
-- JS version sliced the ISO timestamp. Returns auth_plays too so the page can
-- derive period totals (total plays / authenticated plays / sessions) by
-- summing, avoiding a separate totals RPC.
create or replace function public.event_daily_series(
  p_since timestamptz default null,
  p_cassette_id uuid default null
)
returns table(day date, plays bigint, auth_plays bigint, completes bigint, sessions bigint)
language sql
stable security definer
set search_path to 'public'
as $function$
  with bounds as (
    select
      coalesce(
        (p_since at time zone 'utc')::date,
        (select min(created_at at time zone 'utc')::date from public.song_events)
      ) as start_day,
      (now() at time zone 'utc')::date as end_day
  ),
  days as (
    select generate_series(b.start_day, b.end_day, interval '1 day')::date as day
    from bounds b
  ),
  ev as (
    select (created_at at time zone 'utc')::date as day, type, user_id
    from public.song_events
    where (p_since is null or created_at >= p_since)
      and (p_cassette_id is null or cassette_id = p_cassette_id)
      and type in ('play_start', 'play_complete', 'cassette_session_start')
  )
  select
    d.day,
    count(*) filter (where ev.type = 'play_start') as plays,
    count(*) filter (where ev.type = 'play_start' and ev.user_id is not null) as auth_plays,
    count(*) filter (where ev.type = 'play_complete') as completes,
    count(*) filter (where ev.type = 'cassette_session_start') as sessions
  from days d
  left join ev on ev.day = d.day
  group by d.day
  order by d.day;
$function$;
