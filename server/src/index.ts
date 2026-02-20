import dotenv from 'dotenv'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { getEnv } from './lib/env'
import { healthRoutes } from './routes/health'
import { meRoutes } from './routes/me'
import { experiencesRoutes } from './routes/experiences'
import { interviewsRoutes } from './routes/interviews'
import { jobMatchRoutes } from './routes/jobMatch'
import { structuredRoutes } from './routes/structured'
import { plansRoutes } from './routes/plans'
import { analyticsRoutes } from './routes/analytics'
import { onboardingRoutes } from './routes/onboarding'

// Load both .env and .env.local for local development.
dotenv.config()
dotenv.config({ path: '.env.local', override: true })

const env = getEnv()

const app = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV === 'production'
        ? undefined
        : {
            target: 'pino-pretty',
            options: { translateTime: 'SYS:standard', ignore: 'pid,hostname' },
          },
  },
})

await app.register(cors, {
  origin: [/^http:\/\/localhost:\d+$/],
  credentials: true,
})

app.setErrorHandler((err, _req, reply) => {
  const statusCode = (err as any).statusCode ?? 500
  const message = err.message || (statusCode >= 500 ? '서버 오류가 발생했습니다.' : '요청을 처리할 수 없습니다.')
  reply.status(statusCode).send({ error: { message, statusCode, details: (err as any).details } })
})

await app.register(healthRoutes, { prefix: '/api' })
await app.register(meRoutes, { prefix: '/api/v1' })
await app.register(experiencesRoutes, { prefix: '/api/v1' })
await app.register(interviewsRoutes, { prefix: '/api/v1' })
await app.register(jobMatchRoutes, { prefix: '/api/v1' })
await app.register(structuredRoutes, { prefix: '/api/v1' })
await app.register(plansRoutes, { prefix: '/api/v1' })
await app.register(analyticsRoutes, { prefix: '/api/v1' })
await app.register(onboardingRoutes, { prefix: '/api/v1' })

await app.listen({ port: env.SERVER_PORT, host: '0.0.0.0' })
app.log.info({ port: env.SERVER_PORT }, 'API server listening')

