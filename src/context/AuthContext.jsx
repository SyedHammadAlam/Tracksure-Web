import { createContext, useContext, useState, useCallback } from 'react'
import * as authApi from '../api/authApi'

const AuthContext = createContext(null)

// Hardcoded admin password (demo only) — must match VITE_ADMIN_API_SECRET / backend ADMIN_SECRET for map API
const ADMIN_PASSWORD = 'admin123'

function sessionFromLoginResponse(data) {
  return {
    role: 'user',
    id: String(data.userId),
    username: data.username,
    name: data.username,
    email: data.email,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tracksure_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const persist = useCallback((u) => {
    setUser(u)
    if (u) localStorage.setItem('tracksure_user', JSON.stringify(u))
    else localStorage.removeItem('tracksure_user')
  }, [])

  /** After successful /api/auth/register or when you already have a LoginResponse body */
  const applySessionFromLoginResponse = useCallback(
    (data, opts) => {
      const base = sessionFromLoginResponse(data)
      if (opts?.displayName?.trim()) {
        base.name = opts.displayName.trim()
      }
      persist(base)
    },
    [persist],
  )

  const loginAsAdmin = useCallback((password) => {
    if (password !== ADMIN_PASSWORD) return { ok: false, error: 'Invalid admin password' }
    persist({ role: 'admin', id: 'admin', name: 'Admin' })
    return { ok: true }
  }, [persist])

  const loginAsUser = useCallback(
    async (username, password) => {
      const trimmed = username?.trim()
      if (!trimmed || !password?.trim()) {
        return { ok: false, error: 'ID and password required' }
      }
      const r = await authApi.login({ username: trimmed, password })
      if (!r.ok) {
        return {
          ok: false,
          error: r.error || 'Invalid username or password',
        }
      }
      persist(sessionFromLoginResponse(r.data))
      return { ok: true }
    },
    [persist],
  )

  const logout = useCallback(async () => {
    const refresh = user?.refreshToken
    if (user?.role === 'user' && refresh) {
      try {
        await authApi.logout(refresh)
      } catch {
        /* still clear local session */
      }
    }
    persist(null)
  }, [user, persist])

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsAdmin,
        loginAsUser,
        applySessionFromLoginResponse,
        logout,
        isAdmin: user?.role === 'admin',
        isUser: user?.role === 'user',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
