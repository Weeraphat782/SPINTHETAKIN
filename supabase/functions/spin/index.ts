import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionToken } = await req.json()
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'sessionToken is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Validate & consume the session token
    const { data: session, error: sessErr } = await supabase
      .from('pending_sessions')
      .select('*')
      .eq('token', sessionToken)
      .single()

    if (sessErr || !session) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Guard: double-check device hasn't already played (race condition)
    const { data: alreadyPlayed } = await supabase
      .from('players')
      .select('id')
      .eq('device_id', session.device_id)
      .limit(1)
      .single()

    if (alreadyPlayed) {
      await supabase.from('pending_sessions').delete().eq('token', sessionToken)
      return new Response(
        JSON.stringify({ alreadyPlayed: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch eligible prizes (ordered so segmentIndex is stable)
    const { data: prizes, error: prizesErr } = await supabase
      .from('prizes')
      .select('id, name, description, image_url, weight, quantity_remaining, sort_order')
      .eq('active', true)
      .order('sort_order')

    if (prizesErr) throw prizesErr
    if (!prizes || prizes.length === 0) throw new Error('No prizes configured')

    const eligible = prizes.filter(
      (p) => p.quantity_remaining === null || p.quantity_remaining > 0
    )
    if (eligible.length === 0) throw new Error('No eligible prizes available')

    // Weighted random selection
    const totalWeight = eligible.reduce((acc, p) => acc + Number(p.weight), 0)
    let r = Math.random() * totalWeight
    let chosen = eligible[eligible.length - 1]
    for (const p of eligible) {
      r -= Number(p.weight)
      if (r <= 0) { chosen = p; break }
    }

    // segmentIndex is position in the full (not just eligible) prizes array
    const segmentIndex = prizes.findIndex((p) => p.id === chosen.id)

    // Atomically decrement inventory if limited
    if (chosen.quantity_remaining !== null) {
      const { error: decrErr } = await supabase.rpc('decrement_prize_quantity', {
        prize_id: chosen.id,
      })
      if (decrErr) throw decrErr
    }

    // Record the play
    const ip = req.headers.get('x-forwarded-for') ?? null
    const { error: insertErr } = await supabase.from('players').insert({
      nickname: session.nickname,
      company: session.company,
      prize_id: chosen.id,
      prize_name: chosen.name,
      device_id: session.device_id,
      ip,
    })
    if (insertErr) throw insertErr

    // Delete the used session token
    await supabase.from('pending_sessions').delete().eq('token', sessionToken)

    // Clean up expired sessions (older than 30 min)
    await supabase
      .from('pending_sessions')
      .delete()
      .lt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())

    return new Response(
      JSON.stringify({
        prizeId: chosen.id,
        segmentIndex,
        name: chosen.name,
        imageUrl: chosen.image_url,
        description: chosen.description,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
