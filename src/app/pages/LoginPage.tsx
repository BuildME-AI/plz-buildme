import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { useAuth } from '../../lib/auth'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const { signInWithProvider, loading, user } = useAuth()

  useEffect(() => {
    if (!loading && user) navigate(redirect)
  }, [loading, user, navigate, redirect])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-[520px] mx-auto px-8 pt-24 pb-16">
        <h1 className="text-[32px] font-semibold text-[#1A1A1A] mb-2">로그인</h1>
        <p className="text-[15px] text-[#6B7280] mb-8">카카오 계정으로 빠르게 시작하세요</p>

        {!isSupabaseConfigured && (
          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-4 mb-6">
            <p className="text-[13px] text-[#92400E] leading-[1.6]">
              현재 Supabase 환경변수가 설정되지 않아 로그인 기능을 사용할 수 없습니다.
              <br />
              <span className="font-medium">.env</span>에 <span className="font-medium">VITE_SUPABASE_URL</span>,{' '}
              <span className="font-medium">VITE_SUPABASE_ANON_KEY</span>를 설정해 주세요.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            disabled={loading || !isSupabaseConfigured}
            onClick={() => signInWithProvider('kakao')}
            className="w-full rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity hover:opacity-95"
          >
            <img
              src="/kakao-login-btn.png"
              alt="카카오 로그인"
              className="w-full h-auto object-contain block"
            />
          </button>
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-[14px] text-[#0052FF] hover:underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

