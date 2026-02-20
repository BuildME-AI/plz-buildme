import { FastifyInstance } from 'fastify'
import { requireUser } from '../lib/auth'
import { getPlanTier, getUsageCountToday } from '../lib/rateLimit'

export async function meRoutes(app: FastifyInstance) {
  app.get('/me', async (req) => {
    const user = await requireUser(req)
    const plan = await getPlanTier(user.id)
    const used = await getUsageCountToday(user.id, 'analysis')
    const limit = plan === 'free' ? 3 : null
    return {
      user: { id: user.id, email: user.email ?? undefined },
      plan,
      usage: { analysis: { usedToday: used, dailyLimit: limit } },
    }
  })
}

