-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── prizes ───────────────────────────────────────────────────────────────────
create table if not exists prizes (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text not null default '',
  image_url           text not null default '',
  color               text not null default '#C9A84C',
  weight              numeric not null default 10,
  quantity_total      int,
  quantity_remaining  int,
  active              boolean not null default true,
  sort_order          int not null default 0
);

-- ── players ──────────────────────────────────────────────────────────────────
create table if not exists players (
  id          uuid primary key default gen_random_uuid(),
  nickname    text not null,
  company     text not null,
  prize_id    uuid references prizes(id),
  prize_name  text not null default '',
  device_id   text not null,
  ip          text,
  played_at   timestamptz not null default now()
);

create index if not exists players_device_id_idx on players(device_id);
create index if not exists players_played_at_idx on players(played_at desc);

-- ── settings (single row) ────────────────────────────────────────────────────
create table if not exists settings (
  id                  int primary key default 1 check (id = 1),
  game_title          text not null default 'Spin the Takin',
  logo_url            text not null default '',
  music_url           text not null default '',
  music_default_on    boolean not null default true,
  spin_duration_ms    int not null default 4500
);

-- Insert the single settings row if absent
insert into settings (id) values (1) on conflict do nothing;

-- ── pending_sessions ─────────────────────────────────────────────────────────
-- Short-lived session tokens so the client can't tamper with spin results.
create table if not exists pending_sessions (
  token       text primary key,
  nickname    text not null,
  company     text not null,
  device_id   text not null,
  created_at  timestamptz not null default now()
);

-- Auto-expire sessions after 30 minutes (cleaned up by the spin function)
create index if not exists pending_sessions_created_at_idx on pending_sessions(created_at);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Players can read prize names/colours/images (not weights) via the config Edge Function.
-- Direct table access from the client is denied; all writes go through Edge Functions.

alter table prizes enable row level security;
alter table players enable row level security;
alter table settings enable row level security;
alter table pending_sessions enable row level security;

-- Admin service-role key bypasses RLS; anon key gets read-only access to safe tables.

-- Settings: anon can read (no sensitive data)
create policy "anon_read_settings" on settings for select to anon using (true);

-- Prizes: anon can read active prizes only (weight column is still returned here;
-- if you need to hide weights, replace with a config Edge Function using service role)
create policy "anon_read_prizes" on prizes for select to anon using (active = true);

-- ── Atomic inventory decrement ───────────────────────────────────────────────
create or replace function decrement_prize_quantity(prize_id uuid)
returns void as $$
  update prizes
  set quantity_remaining = quantity_remaining - 1
  where id = prize_id and quantity_remaining > 0;
$$ language sql;

-- ── Seed sample prizes ────────────────────────────────────────────────────────
insert into prizes (name, description, color, weight, sort_order) values
  ('Bhutan Sticker',       'A beautiful Bhutan Airlines sticker set.',   '#E07B39', 40, 0),
  ('Bhutan T-Shirt',       'Exclusive Bhutan Airlines T-Shirt.',         '#8B1A1A', 15, 1),
  ('Travel Mug',           'Bhutan Airlines insulated travel mug.',       '#1a2a4a', 10, 2),
  ('Branded Pen',          'Bhutan Airlines collector pen.',              '#2d6a4f', 20, 3),
  ('Discount Voucher',     '10% off your next Bhutan Airlines ticket.',   '#C9A84C',  5, 4),
  ('Try Again!',           'Better luck next time. Give it another spin!','#6b6375', 10, 5)
on conflict do nothing;
