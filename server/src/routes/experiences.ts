import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireUser } from '../lib/auth'
import { createSupabaseAdmin } from '../lib/supabase'

export async function experiencesRoutes(app: FastifyInstance) {
  app.get('/experiences', async (req) => {
    const user = await requireUser(req)
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('experiences')
      .select('id,title,source_type,created_at,updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { experiences: data ?? [] }
  })

  app.post('/experiences', async (req) => {
    const user = await requireUser(req)
    const Body = z
      .object({
        title: z.string().min(1).max(200).optional(),
        sourceType: z.enum(['text', 'link']).default('text'),
        sourceText: z.string().min(1).max(20000).optional(),
        sourceUrl: z.string().url().optional(),
      })
      .refine((b) => (b.sourceType === 'text' ? !!b.sourceText : !!b.sourceUrl), {
        message: 'sourceType에 맞는 sourceText/sourceUrl이 필요합니다.',
      })

    const body = Body.parse(req.body)
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('experiences')
      .insert({
        user_id: user.id,
        title: body.title ?? null,
        source_type: body.sourceType,
        source_text: body.sourceText ?? null,
        source_url: body.sourceUrl ?? null,
      })
      .select('id,title,source_type,source_text,source_url,created_at')
      .single()
    if (error) throw error
    return { experience: data }
  })
}

