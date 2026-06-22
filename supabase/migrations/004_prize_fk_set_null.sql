-- Allow prizes to be deleted even if players have won them
-- (sets prize_id to NULL on player records instead of blocking)
alter table players
  drop constraint if exists players_prize_id_fkey;

alter table players
  add constraint players_prize_id_fkey
    foreign key (prize_id)
    references prizes(id)
    on delete set null;
