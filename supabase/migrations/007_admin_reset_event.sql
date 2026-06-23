-- One-click event reset: restore all quantity_remaining to quantity_total
-- and clear all pity counters. Run before each new event day.

create or replace function admin_reset_event()
returns void
language sql
security definer
set search_path = public
as $$
  update prizes set
    quantity_remaining = quantity_total,
    pity_counter       = 0
  where true;
$$;

-- Grant to both authenticated and anon — admin UI uses anon key client-side
grant execute on function admin_reset_event() to authenticated;
grant execute on function admin_reset_event() to anon;
