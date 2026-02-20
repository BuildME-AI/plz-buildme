import { FastifyInstance } from 'fastify'
import { requireUser } from '../lib/auth'
import { createSupabaseAdmin } from '../lib/supabase'

export async function analyticsRoutes(app: FastifyInstance) {
  // 사용자의 구조화 결과/직무 버전 삭제 (요약용 세부 분석 초기화)
  app.post('/analytics/reset', async (req) => {
    const user = await requireUser(req)
    const supabase = createSupabaseAdmin()

    const { error: delJobsErr } = await supabase
      .from('job_versions')
      .delete()
      .eq('user_id', user.id)
    if (delJobsErr) throw delJobsErr

    const { error: delStructuredErr } = await supabase
      .from('structured_experiences')
      .delete()
      .eq('user_id', user.id)
    if (delStructuredErr) throw delStructuredErr

    return { ok: true }
  })
}

