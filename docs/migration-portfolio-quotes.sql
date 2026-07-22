-- Portfolio quote requests ("¿Tu proyecto necesita imagen?").
--
-- Persists each design-quote request a band sends from the private profile via
-- the "¿Qué necesitas?" modal (sendPortfolioQuote). Until now these only went
-- out as an email to hola@ruidozo.mx and were never stored, so the admin panel
-- had nothing to show — this table is the source of truth for /admin/cotizaciones.
--
-- Mirrors `donation_events`: writes go through the service-role client, so RLS
-- is enabled with no public policies (only service_role, which bypasses RLS,
-- can read or write).

create table if not exists portfolio_quotes (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid references profiles(id) on delete set null,
  -- Snapshot of the requester so the admin can still reach out even if the
  -- profile is later edited or deleted.
  requester_name   text,
  requester_email  text,
  servicios        text[] not null default '{}',
  message          text,
  status           text not null default 'pending' check (status in ('pending', 'attended')),
  attended_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists portfolio_quotes_status_created_idx
  on portfolio_quotes (status, created_at desc);

alter table portfolio_quotes enable row level security;
