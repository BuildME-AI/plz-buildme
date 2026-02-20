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
      .select('id,title,source_type,source_text,source_url,created_at,updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
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

  app.put('/experiences/:id', async (req) => {
    const user = await requireUser(req)
    const Params = z.object({ id: z.string().uuid() })
    const Body = z
      .object({
        title: z.string().min(1).max(200).optional(),
        sourceText: z.string().min(1).max(20000).optional(),
      })
      .refine((b) => b.title != null || b.sourceText != null, {
        message: '수정할 필드가 필요합니다.',
      })

    const { id } = Params.parse(req.params)
    const body = Body.parse(req.body)
    const supabase = createSupabaseAdmin()

    const updatePayload: Record<string, unknown> = {}
    if (body.title != null) updatePayload.title = body.title
    if (body.sourceText != null) updatePayload.source_text = body.sourceText

    const { data, error } = await supabase
      .from('experiences')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id,title,source_type,source_text,source_url,created_at,updated_at')
      .single()
    if (error) throw error
    return { experience: data }
  })

  app.delete('/experiences/:id', async (req) => {
    const user = await requireUser(req)
    const Params = z.object({ id: z.string().uuid() })
    const { id } = Params.parse(req.params)
    const supabase = createSupabaseAdmin()

    const { error } = await supabase.from('experiences').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    return { ok: true }
  })
}

