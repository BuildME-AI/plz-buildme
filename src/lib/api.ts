import { supabase } from './supabaseClient'

function getApiBase(): string {
  const url = import.meta.env.VITE_API_URL
  return typeof url === 'string' && url.length > 0 ? url.replace(/\/$/, '') : ''
}

async function getToken() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBase()
  const url = `${base}/api/v1${path}`
  const token = await getToken()
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(url, { ...init, headers })
  } catch (e: any) {
    const isNetwork = e?.message?.toLowerCase().includes('fetch') || e?.message?.toLowerCase().includes('network')
    const msg = isNetwork ? '네트워크 연결을 확인해 주세요.' : `요청 중 오류가 발생했습니다: ${e.message}`
    const err: any = new Error(msg)
    err.statusCode = 0
    throw err
  }

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg =
      (json && typeof json === 'object' && json.error && json.error.message) ||
      (res.status === 401 ? '로그인이 필요합니다.' : res.status === 502 ? 'AI 응답을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.' : `요청에 실패했습니다. (${res.status} ${res.statusText})`)
    const err: any = new Error(msg)
    err.statusCode = (json && json.error && json.error.statusCode) || res.status
    err.details = json?.error?.details
    throw err
  }
  return (json ?? {}) as T
}
