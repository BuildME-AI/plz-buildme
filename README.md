
## BuildMe – 흩어진 나를 완성하는 AI 포트폴리오

Vite(React Router) 프론트엔드는 유지하면서, Supabase(Auth+Postgres) + Fastify API 서버로 백엔드를 붙인 MVP입니다.

### 구성

- **프론트엔드**: Vite + React + Tailwind (기존 UI 유지)
- **백엔드**: Fastify (`server/src/index.ts`)
- **인증**: Supabase OAuth (Kakao)
- **DB**: Supabase Postgres (스키마: `supabase/schema.sql`)
- **AI 처리**: OpenAI API (서버에서만 호출)

### 로컬 실행

#### 1) 의존성 설치

```bash
npm install
```

#### 2) Supabase 프로젝트 준비

- Supabase에서 새 프로젝트 생성
- SQL Editor에서 `supabase/schema.sql` 실행
- Authentication → Providers에서 Google/Kakao/Naver 활성화(원하는 것만)
- Redirect URL에 로컬 주소 추가: `http://localhost:5173/dashboard`

#### 3) 환경변수 설정

루트에 `.env`를 만들고 `.env.example`를 참고해 채웁니다.

- 프론트(Vite)에서 필요한 값:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- 서버(Fastify)에서 필요한 값:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `SERVER_PORT` (기본 8787)

#### 4) 웹 + API 동시 실행

**백엔드가 꺼져 있으면 `/api/v1/*` 요청 시 `ECONNREFUSED`가 발생합니다.** 아래 중 하나로 반드시 API 서버를 띄운 뒤 사용하세요.

**방법 A – 프론트와 API 동시 실행 (권장)**

```bash
npm run dev:all
```

- 프론트: `http://localhost:5173`
- API: `http://localhost:8787` (같은 터미널에서 함께 실행)

**방법 B – 터미널 두 개**

```bash
# 터미널 1: API 서버
npm run dev:server

# 터미널 2: Vite
npm run dev
```

- API 서버가 `http://localhost:8787`에서 떠 있어야 합니다.
- `GET http://localhost:8787/api/health` 로 정상 응답이 오는지 확인하세요.

**방법 C – API만 다른 주소/포트에서 실행하는 경우**

`.env`에 `VITE_API_URL=http://localhost:8787` 처럼 백엔드 주소를 넣으면, 프록시 대신 해당 URL로 API를 호출합니다. (CORS 허용 필요)

### 주요 API

프론트에서 `/api/*` 요청은 Vite 프록시로 자동 전달됩니다(`vite.config.ts`).

- `GET /api/health`
- `GET /api/v1/me` (플랜/오늘 사용량)
- `GET /api/v1/experiences`
- `POST /api/v1/interviews/start`
- `POST /api/v1/interviews/:sessionId/message`
- `POST /api/v1/interviews/:sessionId/complete`
- `GET /api/v1/structured/:id`
- `POST /api/v1/job-match`

  
