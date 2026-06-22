-- Full CRUD access for authenticated (admin) users on all tables
create policy "admin_all_settings"         on settings         for all to authenticated using (true) with check (true);
create policy "admin_all_prizes"           on prizes           for all to authenticated using (true) with check (true);
create policy "admin_all_players"          on players          for all to authenticated using (true) with check (true);
create policy "admin_all_pending_sessions" on pending_sessions for all to authenticated using (true) with check (true);
