-- Return quantity_remaining after decrement so the player screen can show stock count

create or replace function do_spin(p_session_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session             record;
  v_prize               record;
  v_total_weight        numeric;
  v_r                   numeric;
  v_acc                 numeric := 0;
  v_chosen_id           uuid;
  v_chosen_name         text;
  v_chosen_image        text;
  v_chosen_desc         text;
  v_chosen_is_no_prize  boolean;
  v_segment_index       int;
  v_qty_remaining       integer;
begin
  select * into v_session from pending_sessions where token = p_session_token;
  if not found then
    return json_build_object('error', 'Invalid or expired session token');
  end if;

  if lower(v_session.nickname) not like '%view%' then
    if exists(select 1 from players where device_id = v_session.device_id) then
      delete from pending_sessions where token = p_session_token;
      return json_build_object('alreadyPlayed', true);
    end if;
  end if;

  select sum(weight) into v_total_weight
  from prizes
  where active = true and (quantity_remaining is null or quantity_remaining > 0);

  if v_total_weight is null or v_total_weight = 0 then
    return json_build_object('error', 'No eligible prizes configured');
  end if;

  v_r := random() * v_total_weight;
  for v_prize in (
    select * from prizes
    where active = true and (quantity_remaining is null or quantity_remaining > 0)
    order by sort_order, id
  ) loop
    v_acc := v_acc + v_prize.weight;
    if v_r <= v_acc and v_chosen_id is null then
      v_chosen_id          := v_prize.id;
      v_chosen_name        := v_prize.name;
      v_chosen_image       := v_prize.image_url;
      v_chosen_desc        := v_prize.description;
      v_chosen_is_no_prize := v_prize.is_no_prize;
    end if;
  end loop;

  if v_chosen_id is null then
    select id, name, image_url, description, is_no_prize
    into v_chosen_id, v_chosen_name, v_chosen_image, v_chosen_desc, v_chosen_is_no_prize
    from prizes
    where active = true and (quantity_remaining is null or quantity_remaining > 0)
    order by sort_order desc, id desc limit 1;
  end if;

  select (row_number() over (order by sort_order, id) - 1)::int
  into v_segment_index
  from prizes
  where active = true and id = v_chosen_id;

  update prizes
  set quantity_remaining = quantity_remaining - 1
  where id = v_chosen_id
    and quantity_remaining is not null
    and quantity_remaining > 0;

  -- Retrieve post-decrement quantity (null = unlimited prize)
  select quantity_remaining into v_qty_remaining
  from prizes where id = v_chosen_id;

  insert into players (nickname, company, prize_id, prize_name, device_id)
  values (v_session.nickname, v_session.company, v_chosen_id, v_chosen_name, v_session.device_id);

  delete from pending_sessions where token = p_session_token;
  delete from pending_sessions where created_at < now() - interval '30 minutes';

  return json_build_object(
    'prizeId',            v_chosen_id::text,
    'segmentIndex',       v_segment_index,
    'name',               v_chosen_name,
    'imageUrl',           coalesce(v_chosen_image, ''),
    'description',        coalesce(v_chosen_desc, ''),
    'isNoPrize',          coalesce(v_chosen_is_no_prize, false),
    'quantityRemaining',  v_qty_remaining
  );
end;
$$;

grant execute on function do_spin(text) to anon;
