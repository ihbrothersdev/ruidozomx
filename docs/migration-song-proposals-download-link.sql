-- Adds an optional "download link" to song proposals, shown in the
-- "Propón una rola" modal/form below the listen link, and rendered in the
-- admin proposals panel. Nullable / additive.
alter table song_proposals add column if not exists download_link text;
