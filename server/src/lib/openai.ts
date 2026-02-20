import OpenAI from 'openai'
import { getEnv } from './env'

export function createOpenAI() {
  const env = getEnv()
  return new OpenAI({ apiKey: env.OPENAI_API_KEY })
}

export async function runJsonModel(opts: {
  system: string
  user: string
  model?: string
}): Promise<any> {
  const client = createOpenAI()
  const model = opts.model ?? 'gpt-4o-mini'

  const resp = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.user },
    ],
    response_format: { type: 'json_object' },
  })

  const content = resp.choices[0]?.message?.content
  if (!content) throw new Error('모델 응답이 비어있습니다.')
  return JSON.parse(content)
}

