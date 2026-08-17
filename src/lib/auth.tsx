import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from './supabaseClient'

export type PlatformRole = 'organizer' | 'sales' | 'admin' | 'super_admin'

const PLATFORM_ROLES: PlatformRole[] = ['organizer', 'sales', 'admin', 'super_admin']

export function isAdminRole(role: PlatformRole) {
  return role === 'admin' || role === 'super_admin'
}

export type AuthUser = {
  id: string
  name: string
  email: string
  phone: string
  role: PlatformRole
}

type AuthResult = { error?: string; needsEmailConfirmation?: boolean; role?: AuthUser['role'] }

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signUp: (input: { name: string; email: string; phone: string; password: string }) => Promise<AuthResult>
  logIn: (input: { email: string; password: string }) => Promise<AuthResult>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfile(userId: string, fallbackEmail: string): Promise<AuthUser> {
  const { data } = await supabase
    .from('users')
    .select('full_name, phone, email, role')
    .eq('id', userId)
    .maybeSingle()

  return {
    id: userId,
    name: data?.full_name ?? '',
    email: data?.email ?? fallbackEmail,
    phone: data?.phone ?? '',
    role: PLATFORM_ROLES.includes(data?.role as PlatformRole) ? (data!.role as PlatformRole) : 'organizer',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(await loadProfile(session.user.id, session.user.email ?? ''))
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(await loadProfile(session.user.id, session.user.email ?? ''))
      } else {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const signUp: AuthContextValue['signUp'] = async ({ name, email, phone, password }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, phone } },
      })
      if (error) return { error: error.message }
      // If email confirmation is required, Supabase creates the user but
      // returns no session — there's nothing to log in to yet.
      if (!data.session) return { needsEmailConfirmation: true }
      return {}
    }

    const logIn: AuthContextValue['logIn'] = async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      const profile = await loadProfile(data.user.id, data.user.email ?? email)
      return { role: profile.role }
    }

    const logOut = async () => {
      await supabase.auth.signOut()
    }

    return { user, loading, signUp, logIn, logOut }
  }, [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
