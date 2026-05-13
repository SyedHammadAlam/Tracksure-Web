import { createContext, useContext, useState, useCallback } from 'react'
import * as authApi from '../api/authApi'

const AuthContext = createContext(null)

function sessionFromLoginResponse(data) {
  // Some backends nest user data inside a 'user' object
  const source = data.user || data;

  // Extract role string from various possible field names/structures
  const roleValue = source.role || 
                   (Array.isArray(source.roles) ? source.roles[0] : null) || 
                   (Array.isArray(source.authorities) ? source.authorities[0]?.authority : null) || 
                   '';

  const normalizedRole = String(roleValue).toLowerCase().includes('admin') ? 'admin' : 'user';

  return {
    role: normalizedRole,
    id: String(source.userId || source.id || ''),
    username: source.username,
    name: source.username || source.name,
    email: source.email,
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


  const login = useCallback(
    async (username, password) => {
      const trimmed = username?.trim()
      if (!trimmed || !password?.trim()) {
        return { ok: false, error: 'Username and password required' }
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
    if (refresh) {
      try {
        await authApi.logout(refresh)
      } catch {
        /* still clear local session */
      }
    }
    persist(null)
  }, [user, persist])

  const updateCurrentUser = useCallback(
    (updates) => {
      if (!user) return
      persist({ ...user, ...updates })
    },
    [user, persist],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        applySessionFromLoginResponse,
        updateCurrentUser,
        logout,
        isAdmin: user?.role === 'admin',
        isUser: user?.role === 'user' || user?.role === 'customer',
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
