import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, requireSupabase } from './supabaseClient'

type AuthState = {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithProvider: (provider: 'google' | 'kakao' | 'naver') => Promise<void>
  signOut: () => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let alive = true
    const supabase = requireSupabase()
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session ?? null)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const api = useMemo<AuthState>(
    () => ({
      session,
      user,
      loading,
      async signInWithProvider(provider) {
        const supabase = requireSupabase()
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: window.location.origin + '/dashboard' },
        })
        if (error) throw error
      },
      async signOut() {
        const supabase = requireSupabase()
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      },
      async getAccessToken() {
        if (!isSupabaseConfigured) return null
        const supabase = requireSupabase()
        const { data } = await supabase.auth.getSession()
        return data.session?.access_token ?? null
      },
    }),
    [session, user, loading],
  )

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider가 필요합니다.')
  return ctx
}

