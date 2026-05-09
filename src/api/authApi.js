import { apiFetch, parseApiError } from './client'

/**
 * @returns {Promise<{ ok: true, data: object } | { ok: false, error: string }>}
 */
export async function register({ username, email, password, confirmPassword }) {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: { username, email, password, confirmPassword },
  })

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }

  const data = await res.json()
  return { ok: true, data }
}

export async function login({ username, password }) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: { username, password },
  })

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }

  const data = await res.json()
  return { ok: true, data }
}

export async function logout(refreshToken) {
  const res = await apiFetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'X-Refresh-Token': refreshToken },
  })

  return res.ok || res.status === 204
}

