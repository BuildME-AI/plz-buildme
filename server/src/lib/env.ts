import { z } from 'zod'

const EnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  SERVER_PORT: z.coerce.number().int().positive().default(8787),
})

export type Env = z.infer<typeof EnvSchema>

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`환경변수 설정이 올바르지 않습니다.\n${msg}`)
  }
  return parsed.data
}

