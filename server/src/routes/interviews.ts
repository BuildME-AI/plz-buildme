import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireUser } from '../lib/auth'
import { createSupabaseAdmin } from '../lib/supabase'
import { INTERVIEW_SYSTEM_PROMPT, INTERVIEW_FIRST_TURN_INSTRUCTION, INTERVIEW_FIRST_TURN_STEP_MODE, INTERVIEW_STEP_MODE_USER_INSTRUCTION, STRUCTURE_SYSTEM_PROMPT } from '../lib/prompts'

const STEP_ORDER = ['company', 'role', 'duration', 'problem', 'action', 'result']
const STEP_MODE_SENTINEL = '[STEP_MODE]'
import { runJsonModel } from '../lib/openai'
import { assertWithinFreeLimit, recordUsage } from '../lib/rateLimit'

function formatConversation(messages: Array<{ role: string; content: string }>) {
  return messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
}

export async function interviewsRoutes(app: FastifyInstance) {
  // Start an interview session from raw experience text/link.
  app.post('/interviews/start', async (req) => {
    const user = await requireUser(req)
    const Body = z.object({
      title: z.string().min(1).max(200).optional(),
      experienceText: z.string().min(1).max(20000).optional(),
      experienceUrl: z.string().url().optional(),
    })
    const body = Body.parse(req.body)
    if (!body.experienceText && !body.experienceUrl) {
      throw Object.assign(new Error('experienceText 또는 experienceUrl 중 하나가 필요합니다.'), { statusCode: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data: exp, error: expErr } = await supabase
      .from('experiences')
      .insert({
        user_id: user.id,
        title: body.title ?? null,
        source_type: body.experienceUrl ? 'link' : 'text',
        source_text: body.experienceText ?? null,
        source_url: body.experienceUrl ?? null,
      })
      .select('id,source_text,source_url')
      .single()
    if (expErr) {
      throw Object.assign(new Error('경험 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'), { statusCode: 500 })
    }

    const { data: session, error: sessErr } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        experience_id: exp.id,
        status: 'active',
        progress: 0,
      })
      .select('id,progress')
      .single()
    if (sessErr) {
      throw Object.assign(new Error('인터뷰 세션을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.'), { statusCode: 500 })
    }

    const isStepMode = body.experienceText?.trim() === STEP_MODE_SENTINEL
    const seed = isStepMode
      ? STEP_MODE_SENTINEL
      : body.experienceText
        ? `사용자 경험 입력(텍스트):\n${body.experienceText}`
        : `사용자 경험 입력(SNS 링크):\n${body.experienceUrl}\n(링크 내용은 서버가 직접 크롤링하지 않는다. 사용자에게 핵심 내용을 요약해달라고 요청하라.)`

    let first: any
    try {
      first = await runJsonModel({
        system: INTERVIEW_SYSTEM_PROMPT,
        user: isStepMode ? `${seed}\n\n${INTERVIEW_FIRST_TURN_STEP_MODE}` : `${seed}\n\n${INTERVIEW_FIRST_TURN_INSTRUCTION}`,
      })
    } catch (modelErr: any) {
      throw Object.assign(
        new Error(modelErr?.message?.includes('인증') ? '로그인이 필요합니다.' : 'AI 응답을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.'),
        { statusCode: 502 }
      )
    }

    let aiText: string
    try {
      aiText = z.object({ type: z.string(), progress: z.number(), message: z.string() }).parse(first).message
    } catch {
      throw Object.assign(new Error('AI 응답 형식 오류입니다. 다시 시도해 주세요.'), { statusCode: 502 })
    }
    const { error: msgErr } = await supabase.from('interview_messages').insert({
      session_id: session.id,
      user_id: user.id,
      role: 'ai',
      content: aiText,
    })
    if (msgErr) throw msgErr

    return { sessionId: session.id, progress: 0, message: aiText, stepMode: isStepMode }
  })

  // Send a user message, receive next AI question or done.
  app.post('/interviews/:sessionId/message', async (req) => {
    const user = await requireUser(req)
    const Params = z.object({ sessionId: z.string().uuid() })
    const Body = z.object({ text: z.string().min(1).max(5000) })
    const { sessionId } = Params.parse(req.params)
    const body = Body.parse(req.body)

    const supabase = createSupabaseAdmin()
    const { data: session, error: sessErr } = await supabase
      .from('interview_sessions')
      .select('id,experience_id,status,progress,ai_summary')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()
    if (sessErr) throw sessErr
    if (session.status !== 'active') {
      throw Object.assign(new Error('이미 종료된 인터뷰입니다.'), { statusCode: 400 })
    }

    const { error: userMsgErr } = await supabase.from('interview_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'user',
      content: body.text,
    })
    if (userMsgErr) throw userMsgErr

    const { data: exp, error: expErr } = await supabase
      .from('experiences')
      .select('source_text,source_url')
      .eq('id', session.experience_id)
      .eq('user_id', user.id)
      .single()
    if (expErr) throw expErr

    const { data: msgs, error: msgsErr } = await supabase
      .from('interview_messages')
      .select('role,content,created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(30)
    if (msgsErr) throw msgsErr

    const conv = formatConversation((msgs ?? []).map((m) => ({ role: m.role, content: m.content })))
    const seed = exp.source_text
      ? `원문 경험(텍스트):\n${exp.source_text}`
      : `원문 경험(SNS 링크):\n${exp.source_url}\n(링크 내용은 크롤링하지 않는다. 사용자에게 핵심 내용을 요약해달라고 요청하라.)`

    const lastUserContent = (msgs ?? []).filter((m) => m.role === 'user').pop()?.content ?? ''
    const isStepMessage = lastUserContent.includes('[STEP:')
    const defaultInstruction = '사용자 답변을 6개 항목(company, role, duration, problem, action, result)으로 개별 평가하라. 부족하거나 추상적인 항목이 있으면 그 항목에 대해서만 구체화 질문 1~2개만 출력하라. 전체를 다시 묻지 말고 해당 항목만 질문하라. 모든 항목이 충분하면 type을 "done"으로 하라.'

    const next = await runJsonModel({
      system: INTERVIEW_SYSTEM_PROMPT,
      user: `${seed}\n\n현재 대화 로그:\n${conv}\n\n${isStepMessage ? INTERVIEW_STEP_MODE_USER_INSTRUCTION(STEP_ORDER) : defaultInstruction}`,
    })

    const parsed = z
      .object({
        type: z.enum(['question', 'done']),
        progress: z.number().min(0).max(100),
        message: z.string().min(1),
        nextStep: z.enum(['company', 'role', 'duration', 'problem', 'action', 'result', 'done']).optional(),
      })
      .parse(next)

    const { error: aiMsgErr } = await supabase.from('interview_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'ai',
      content: parsed.message,
    })
    if (aiMsgErr) throw aiMsgErr

    const { error: updErr } = await supabase
      .from('interview_sessions')
      .update({ progress: Math.round(parsed.progress) })
      .eq('id', sessionId)
      .eq('user_id', user.id)
    if (updErr) throw updErr

    return {
      type: parsed.type,
      progress: Math.round(parsed.progress),
      message: parsed.message,
      nextStep: parsed.nextStep,
    }
  })

  // Complete: generate structured output, store it, and close session.
  app.post('/interviews/:sessionId/complete', async (req) => {
    const user = await requireUser(req)
    const Params = z.object({ sessionId: z.string().uuid() })
    const { sessionId } = Params.parse(req.params)

    // Free limit: 3 analyses per day.
    await assertWithinFreeLimit(user.id, 'analysis', 3)

    const supabase = createSupabaseAdmin()
    const { data: session, error: sessErr } = await supabase
      .from('interview_sessions')
      .select('id,experience_id,status')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()
    if (sessErr) throw sessErr
    if (session.status !== 'active') {
      throw Object.assign(new Error('이미 종료된 인터뷰입니다.'), { statusCode: 400 })
    }

    const { data: exp, error: expErr } = await supabase
      .from('experiences')
      .select('id,source_text,source_url')
      .eq('id', session.experience_id)
      .eq('user_id', user.id)
      .single()
    if (expErr) throw expErr

    const { data: msgs, error: msgsErr } = await supabase
      .from('interview_messages')
      .select('role,content,created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    if (msgsErr) throw msgsErr

    const conv = formatConversation((msgs ?? []).map((m) => ({ role: m.role, content: m.content })))
    const seed = exp.source_text
      ? `원문 경험(텍스트):\n${exp.source_text}`
      : `원문 경험(SNS 링크):\n${exp.source_url}\n(링크 내용은 크롤링하지 않는다. 대화에 포함된 사용자 요약만 사용하라.)`

    const structured = await runJsonModel({
      system: STRUCTURE_SYSTEM_PROMPT,
      user: `${seed}\n\n인터뷰 대화 로그:\n${conv}\n\n위 규칙을 지켜 결과를 출력하라.`,
    })

    const StructuredSchema = z.object({
      situation: z.string().min(1),
      role_and_action: z.string().min(1),
      result: z.string().min(1),
      growth: z.string().min(1),
      scores: z.object({
        specificity: z.number().min(0).max(100),
        impact: z.number().min(0).max(100),
        job_fit: z.number().min(0).max(100),
        overall: z.number().min(0).max(100),
      }),
      distortion_warnings: z.array(z.object({ type: z.string(), message: z.string() })),
      improvement_suggestions: z.array(z.string()),
      assumptions: z.array(z.string()),
    })
    const out = StructuredSchema.parse(structured)

    const { data: saved, error: saveErr } = await supabase
      .from('structured_experiences')
      .insert({
        user_id: user.id,
        experience_id: exp.id,
        session_id: sessionId,
        situation: out.situation,
        role_and_action: out.role_and_action,
        result: out.result,
        growth: out.growth,
        specificity_score: Math.round(out.scores.specificity),
        impact_score: Math.round(out.scores.impact),
        job_fit_score: Math.round(out.scores.job_fit),
        overall_score: Math.round(out.scores.overall),
        distortion_warnings: out.distortion_warnings,
        improvement_suggestions: out.improvement_suggestions,
        assumptions: out.assumptions,
      })
      .select(
        'id,situation,role_and_action,result,growth,specificity_score,impact_score,job_fit_score,overall_score,distortion_warnings,improvement_suggestions,assumptions,created_at',
      )
      .single()
    if (saveErr) throw saveErr

    const { error: closeErr } = await supabase
      .from('interview_sessions')
      .update({ status: 'completed', progress: 100 })
      .eq('id', sessionId)
      .eq('user_id', user.id)
    if (closeErr) throw closeErr

    await recordUsage(user.id, 'analysis')

    return { structured: saved }
  })
}

