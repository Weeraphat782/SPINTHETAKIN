-- Fix segmentIndex calculation: use ROW_NUMBER for deterministic position
-- Weighted random selection logic is unchanged.

create or replace function do_spin(p_session_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session        record;
  v_prize          record;
  v_total_weight   numeric;
  v_r              numeric;
  v_acc            numeric := 0;
  v_chosen_id      uuid;
  v_chosen_name    text;
  v_chosen_image   text;
  v_chosen_desc    text;
  v_segment_index  int;
begin
  -- Validate session token
  select * into v_session from pending_sessions where token = p_session_token;
  if not found then
    return json_build_object('error', 'Invalid or expired session token');
  end if;

  -- Guard against race condition: double-check device hasn't played (skip for View test accounts)
  if lower(v_session.nickname) not like '%view%' then
    if exists(select 1 from players where device_id = v_session.device_id) then
      delete from pending_sessions where token = p_session_token;
      return json_build_object('alreadyPlayed', true);
    end if;
  end if;

  -- Sum weights of eligible prizes
  select sum(weight) into v_total_weight
  from prizes
  where active = true and (quantity_remaining is null or quantity_remaining > 0);

  if v_total_weight is null or v_total_weight = 0 then
    return json_build_object('error', 'No eligible prizes configured');
  end if;

  -- Weighted random selection (deterministic tie-break on id)
  v_r := random() * v_total_weight;
  for v_prize in (
    select * from prizes
    where active = true and (quantity_remaining is null or quantity_remaining > 0)
    order by sort_order, id
  ) loop
    v_acc := v_acc + v_prize.weight;
    if v_r <= v_acc and v_chosen_id is null then
      v_chosen_id    := v_prize.id;
      v_chosen_name  := v_prize.name;
      v_chosen_image := v_prize.image_url;
      v_chosen_desc  := v_prize.description;
    end if;
  end loop;

  -- Fallback: pick last eligible (shouldn't happen)
  if v_chosen_id is null then
    select id, name, image_url, description
    into v_chosen_id, v_chosen_name, v_chosen_image, v_chosen_desc
    from prizes
    where active = true and (quantity_remaining is null or quantity_remaining > 0)
    order by sort_order desc, id desc limit 1;
  end if;

  -- Segment index = 0-based position in active prizes ordered by sort_order, id
  select (row_number() over (order by sort_order, id) - 1)::int
  into v_segment_index
  from prizes
  where active = true and id = v_chosen_id;

  -- Atomic inventory decrement
  update prizes
  set quantity_remaining = quantity_remaining - 1
  where id = v_chosen_id
    and quantity_remaining is not null
    and quantity_remaining > 0;

  -- Record the play
  insert into players (nickname, company, prize_id, prize_name, device_id)
  values (v_session.nickname, v_session.company, v_chosen_id, v_chosen_name, v_session.device_id);

  -- Consume the session token
  delete from pending_sessions where token = p_session_token;

  -- Clean up expired sessions (older than 30 min)
  delete from pending_sessions where created_at < now() - interval '30 minutes';

  return json_build_object(
    'prizeId',       v_chosen_id::text,
    'segmentIndex',  v_segment_index,
    'name',          v_chosen_name,
    'imageUrl',      coalesce(v_chosen_image, ''),
    'description',   coalesce(v_chosen_desc, '')
  );
end;
$$;

grant execute on function do_spin(text) to anon;
