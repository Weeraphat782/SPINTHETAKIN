import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Prize = {
  id: string
  name: string
  description: string
  image_url: string
  color: string
  weight: number
  quantity_total: number | null
  quantity_remaining: number | null
  active: boolean
  sort_order: number
  is_no_prize: boolean
}

export type Player = {
  id: string
  nickname: string
  company: string
  prize_id: string
  prize_name: string
  device_id: string
  ip: string | null
  played_at: string
}

export type Settings = {
  game_title: string
  logo_url: string
  music_url: string
  music_default_on: boolean
  spin_duration_ms: number
}

export type PublicPrize = {
  id: string
  name: string
  image_url: string
  color: string
  sort_order: number
}

export type GameConfig = {
  gameTitle: string
  logoUrl: string
  musicUrl: string
  musicDefaultOn: boolean
  spinDurationMs: number
  prizes: PublicPrize[]
}

export type SpinResult = {
  prizeId: string
  segmentIndex: number
  name: string
  imageUrl: string
  description: string
  isNoPrize: boolean
}
