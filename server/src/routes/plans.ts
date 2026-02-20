import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireUser } from '../lib/auth'
import { createSupabaseAdmin } from '../lib/supabase'
import { getPlanTier, getUsageCountToday } from '../lib/rateLimit'

const PLANS = [
  {
    id: 'free',
    name: '무료',
    description: '하루 3회 분석 가능',
    features: ['하루 3회 분석', '기본 STAR 구조화'],
  },
  {
    id: 'premium',
    name: '프리미엄',
    description: '월 구독 · 무제한 분석',
    features: ['무제한 분석', '기업/직무 맞춤 최적화', '상세 분석 리포트'],
  },
  {
    id: 'b2b',
    name: 'B2B',
    description: '대학/기업용 확장',
    features: ['대학 취업지원센터 라이선스', '기업 채용 매칭 솔루션 통합'],
  },
] as const

export async function plansRoutes(app: FastifyInstance) {
  app.get('/plans', async (req) => {
    const user = await requireUser(req)
    const current = await getPlanTier(user.id)
    const used = await getUsageCountToday(user.id, 'analysis')
    const limit = current === 'free' ? 3 : null

    return {
      currentPlan: current,
      usage: { analysis: { usedToday: used, dailyLimit: limit } },
      plans: PLANS,
    }
  })

  app.post('/plans/upgrade', async (req) => {
    const user = await requireUser(req)
    const Body = z.object({
      plan: z.enum(['free', 'premium', 'b2b']),
    })
    const body = Body.parse(req.body)

    const supabase = createSupabaseAdmin()
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          email: user.email ?? null,
          plan: body.plan,
        },
        { onConflict: 'user_id' },
      )
    if (error) throw error

    const used = await getUsageCountToday(user.id, 'analysis')
    const limit = body.plan === 'free' ? 3 : null

    return {
      currentPlan: body.plan,
      usage: { analysis: { usedToday: used, dailyLimit: limit } },
    }
  })
}

