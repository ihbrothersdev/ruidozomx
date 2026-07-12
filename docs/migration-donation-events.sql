-- Donation attempt tracking.
--
-- Records when a visitor engages the donation flow: clicking "Cooperar"
-- (donation_start) and clicking a specific amount that opens Stripe Checkout
-- (donation_attempt). This is *intent*, not a confirmed payment — Stripe is the
-- source of truth for completed donations.
--
-- Mirrors `song_events`: writes go through the service-role client, so RLS is
-- enabled with no public policies (only service_role, which bypasses RLS, can
-- read or write).

create table if not exists donation_events (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('donation_start', 'donation_attempt')),
  user_id     uuid references profiles(id) on delete set null,
  session_id  text,
  frequency   text check (frequency in ('once', 'monthly')),
  amount_mxn  integer,
  amount_usd  numeric(10, 2),
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists donation_events_type_created_idx
  on donation_events (type, created_at desc);

alter table donation_events enable row level security;
