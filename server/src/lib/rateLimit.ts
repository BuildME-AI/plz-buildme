import { createSupabaseAdmin } from './supabase'

export async function getPlanTier(userId: string): Promise<'free' | 'premium' | 'b2b'> {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.from('profiles').select('plan').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return (data?.plan as any) ?? 'free'
}

export async function getUsageCountToday(userId: string, eventType: string): Promise<number> {
  const supabase = createSupabaseAdmin()
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const { count, error } = await supabase
    .from('usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', eventType)
    .gte('created_at', start.toISOString())
  if (error) throw error
  return count ?? 0
}

export async function recordUsage(userId: string, eventType: string): Promise<void> {
  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from('usage_events').insert({ user_id: userId, event_type: eventType })
  if (error) throw error
}

export async function assertWithinFreeLimit(userId: string, eventType: string, freeDailyLimit: number) {
  const tier = await getPlanTier(userId)
  if (tier !== 'free') return
  const used = await getUsageCountToday(userId, eventType)
  if (used >= freeDailyLimit) {
    throw Object.assign(new Error(`무료 플랜은 하루 ${freeDailyLimit}회까지 가능합니다.`), {
      statusCode: 429,
      details: { used, limit: freeDailyLimit },
    })
  }
}

