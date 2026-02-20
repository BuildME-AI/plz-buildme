import { FastifyRequest } from 'fastify'
import { createSupabaseAdmin } from './supabase'

export type AuthedUser = {
  id: string
  email?: string | null
}

export async function requireUser(req: FastifyRequest): Promise<AuthedUser> {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    throw Object.assign(new Error('인증이 필요합니다.'), { statusCode: 401 })
  }

  const token = auth.slice('Bearer '.length).trim()
  if (!token) throw Object.assign(new Error('인증이 필요합니다.'), { statusCode: 401 })

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) {
    throw Object.assign(new Error('유효하지 않은 토큰입니다.'), { statusCode: 401 })
  }

  return { id: data.user.id, email: data.user.email }
}

