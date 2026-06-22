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
    const { nickname, company, deviceId } = await req.json()

    if (!nickname?.trim() || !company?.trim() || !deviceId) {
      return new Response(
        JSON.stringify({ error: 'nickname, company, and deviceId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Check if device has already played
    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .eq('device_id', deviceId)
      .limit(1)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ alreadyPlayed: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create pending session token
    const token = crypto.randomUUID()
    const { error: insertErr } = await supabase
      .from('pending_sessions')
      .insert({ token, nickname: nickname.trim(), company: company.trim(), device_id: deviceId })

    if (insertErr) throw insertErr

    return new Response(
      JSON.stringify({ sessionToken: token }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
