import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireUser } from '../lib/auth'
import { createSupabaseAdmin } from '../lib/supabase'
import { JOB_MATCH_SYSTEM_PROMPT } from '../lib/prompts'
import { runJsonModel } from '../lib/openai'

export async function jobMatchRoutes(app: FastifyInstance) {
  app.post('/job-match', async (req) => {
    const user = await requireUser(req)
    const Body = z.object({
      structuredId: z.string().uuid(),
      targetRole: z.string().min(1).max(200),
      targetCompany: z.string().min(1).max(200).optional(),
    })
    const body = Body.parse(req.body)

    const supabase = createSupabaseAdmin()
    const { data: structured, error } = await supabase
      .from('structured_experiences')
      .select('id,situation,role_and_action,result,growth')
      .eq('id', body.structuredId)
      .eq('user_id', user.id)
      .single()
    if (error) throw error

    const input = `
구조화된 경험:
- 문제 상황: ${structured.situation}
- 역할 및 행동: ${structured.role_and_action}
- 성과: ${structured.result}
- 성장 및 확장된 역량: ${structured.growth}

목표:
- 직무: ${body.targetRole}
${body.targetCompany ? `- 기업: ${body.targetCompany}` : ''}
`.trim()

    const result = await runJsonModel({
      system: JOB_MATCH_SYSTEM_PROMPT,
      user: input,
    })

    const Parsed = z.object({
      keywords: z.array(z.string()).default([]),
      optimized_paragraph: z.string().min(1),
      match_score: z.number().min(0).max(100),
      feedback: z.array(z.string()).default([]),
    })
    const out = Parsed.parse(result)

    const { data: saved, error: saveErr } = await supabase
      .from('job_versions')
      .insert({
        user_id: user.id,
        structured_experience_id: structured.id,
        target_role: body.targetRole,
        target_company: body.targetCompany ?? null,
        keywords: out.keywords,
        optimized_paragraph: out.optimized_paragraph,
        match_score: Math.round(out.match_score),
        feedback: out.feedback,
      })
      .select('id,keywords,optimized_paragraph,match_score,feedback,created_at')
      .single()
    if (saveErr) throw saveErr

    return { jobVersion: saved }
  })
}

