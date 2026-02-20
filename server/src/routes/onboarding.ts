import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireUser } from '../lib/auth'
import { createSupabaseAdmin } from '../lib/supabase'

const PayloadSchema = z.object({
  name: z.string().max(120).default(''),
  bio: z.string().max(300).default(''),
  targetJob: z.string().max(120).default(''),
  experience: z.string().max(20000).default(''),
  achievement: z.string().max(5000).default(''),
  purpose: z.string().max(120).default(''),
})

const PutBody = z.object({
  payload: PayloadSchema,
  completedStep: z.number().int().min(0).max(7).default(0),
  completed: z.boolean().optional(),
})

export async function onboardingRoutes(app: FastifyInstance) {
  app.get('/onboarding', async (req) => {
    const user = await requireUser(req)
    const supabase = createSupabaseAdmin()

    const { data, error } = await supabase
      .from('onboarding_profiles')
      .select('payload,completed_step,completed_at,updated_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw error

    if (!data) return { onboarding: null }

    return {
      onboarding: {
        payload: data.payload ?? {},
        completedStep: data.completed_step ?? 0,
        completed: Boolean(data.completed_at),
        updatedAt: data.updated_at ?? null,
      },
    }
  })

  app.put('/onboarding', async (req) => {
    const user = await requireUser(req)
    const body = PutBody.parse(req.body)
    const supabase = createSupabaseAdmin()

    const { data: existing, error: existingErr } = await supabase
      .from('onboarding_profiles')
      .select('completed_at')
      .eq('user_id', user.id)
      .maybeSingle()
    if (existingErr) throw existingErr

    const completedAt = body.completed === true ? existing?.completed_at ?? new Date().toISOString() : existing?.completed_at ?? null

    const { data, error } = await supabase
      .from('onboarding_profiles')
      .upsert(
        {
          user_id: user.id,
          payload: body.payload,
          completed_step: body.completedStep,
          completed_at: completedAt,
        },
        { onConflict: 'user_id' },
      )
      .select('payload,completed_step,completed_at,updated_at')
      .single()

    if (error) throw error

    return {
      onboarding: {
        payload: data.payload ?? {},
        completedStep: data.completed_step ?? 0,
        completed: Boolean(data.completed_at),
        updatedAt: data.updated_at ?? null,
      },
    }
  })

  app.post('/onboarding/complete', async (req) => {
    const user = await requireUser(req)
    const body = z
      .object({
        payload: PayloadSchema.optional(),
      })
      .parse(req.body ?? {})
    const supabase = createSupabaseAdmin()

    const { data: existing, error: existingErr } = await supabase
      .from('onboarding_profiles')
      .select('payload')
      .eq('user_id', user.id)
      .maybeSingle()
    if (existingErr) throw existingErr

    const mergedPayload = {
      ...(existing?.payload ?? {}),
      ...(body.payload ?? {}),
    }

    const { data, error } = await supabase
      .from('onboarding_profiles')
      .upsert(
        {
          user_id: user.id,
          payload: mergedPayload,
          completed_step: 7,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select('payload,completed_step,completed_at,updated_at')
      .single()
    if (error) throw error

    return {
      onboarding: {
        payload: data.payload ?? {},
        completedStep: data.completed_step ?? 0,
        completed: Boolean(data.completed_at),
        updatedAt: data.updated_at ?? null,
      },
    }
  })
}

