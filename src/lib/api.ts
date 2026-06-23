import { supabase } from './supabase'
import type { GameConfig, SpinResult, Prize, Player, Settings } from './supabase'

// ── Public API ──────────────────────────────────────────────────────────────

export async function getConfig(): Promise<GameConfig> {
  const { data: settings, error: sErr } = await supabase
    .from('settings')
    .select('*')
    .single()
  if (sErr) throw sErr

  const { data: prizes, error: pErr } = await supabase
    .from('prizes')
    .select('id, name, image_url, color, sort_order')
    .eq('active', true)
    .order('sort_order')
    .order('id')
  if (pErr) throw pErr

  return {
    gameTitle: settings.game_title,
    logoUrl: settings.logo_url,
    musicUrl: settings.music_url,
    musicDefaultOn: settings.music_default_on,
    spinDurationMs: settings.spin_duration_ms,
    prizes: prizes ?? [],
  }
}

export async function createSession(
  nickname: string,
  company: string,
  deviceId: string
): Promise<{ sessionToken: string } | { alreadyPlayed: true }> {
  const { data, error } = await supabase.rpc('create_spin_session', {
    p_nickname: nickname,
    p_company: company,
    p_device_id: deviceId,
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

export async function spin(sessionToken: string): Promise<SpinResult> {
  const { data, error } = await supabase.rpc('do_spin', {
    p_session_token: sessionToken,
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return {
    ...data,
    isNoPrize: Boolean(data?.isNoPrize),
    quantityRemaining: data?.quantityRemaining ?? null,
  }
}

// ── Admin API ────────────────────────────────────────────────────────────────

export async function adminGetPrizes(): Promise<Prize[]> {
  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .order('sort_order')
    .order('id')
  if (error) throw error
  return data ?? []
}

export async function adminCreatePrize(
  prize: Omit<Prize, 'id'>
): Promise<Prize> {
  const { data, error } = await supabase
    .from('prizes')
    .insert(prize)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminUpdatePrize(
  id: string,
  updates: Partial<Prize>
): Promise<Prize> {
  const { data, error } = await supabase
    .from('prizes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminDeletePrize(id: string): Promise<void> {
  const { error } = await supabase.from('prizes').delete().eq('id', id)
  if (error) throw error
}

export async function adminGetPlayers(search?: string): Promise<Player[]> {
  let query = supabase
    .from('players')
    .select('*')
    .order('played_at', { ascending: false })

  if (search) {
    query = query.or(`nickname.ilike.%${search}%,company.ilike.%${search}%,prize_name.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function adminGetSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('settings').select('*').single()
  if (error) throw error
  return data
}

export async function adminUpdateSettings(
  updates: Partial<Settings>
): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .update(updates)
    .eq('id', 1)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminResetDeviceLocks(): Promise<void> {
  const { error } = await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw error
}

export async function adminResetEvent(): Promise<void> {
  const { error } = await supabase.rpc('admin_reset_event')
  if (error) throw error
}

export async function adminUploadAsset(
  bucket: 'prize-images' | 'branding-assets' | 'music',
  file: File
): Promise<string> {
  const path = `${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export function exportPlayersCSV(players: Player[]): void {
  const header = 'ID,Nickname,Company,Prize,Played At,Device ID\n'
  const rows = players
    .map((p) =>
      [p.id, p.nickname, p.company, p.prize_name, p.played_at, p.device_id]
        .map((v) => `"${v ?? ''}"`)
        .join(',')
    )
    .join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `players-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
