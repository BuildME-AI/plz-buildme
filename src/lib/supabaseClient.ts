import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = !!url && !!anonKey

export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!) : null

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase 설정이 없습니다. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 설정해 주세요.')
  }
  return supabase
}

