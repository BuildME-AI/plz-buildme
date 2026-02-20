import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireUser } from '../lib/auth'
import { createSupabaseAdmin } from '../lib/supabase'

export async function structuredRoutes(app: FastifyInstance) {
  app.get('/structured/:id', async (req) => {
    const user = await requireUser(req)
    const Params = z.object({ id: z.string().uuid() })
    const { id } = Params.parse(req.params)

    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('structured_experiences')
      .select(
        'id,experience_id,session_id,situation,role_and_action,result,growth,specificity_score,impact_score,job_fit_score,overall_score,distortion_warnings,improvement_suggestions,assumptions,created_at',
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    if (error) throw error
    return { structured: data }
  })
}

