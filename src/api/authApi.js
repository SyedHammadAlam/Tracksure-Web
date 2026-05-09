import { apiFetch, parseApiError } from './client'

<<<<<<< HEAD
/**
 * @returns {Promise<{ ok: true, data: object } | { ok: false, error: string }>}
 */
=======
>>>>>>> 7dbea72 (Second Update)
export async function register({ username, email, password, confirmPassword }) {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: { username, email, password, confirmPassword },
  })
<<<<<<< HEAD
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
=======

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }

>>>>>>> 7dbea72 (Second Update)
  const data = await res.json()
  return { ok: true, data }
}

export async function login({ username, password }) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: { username, password },
  })
<<<<<<< HEAD
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
=======

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }

>>>>>>> 7dbea72 (Second Update)
  const data = await res.json()
  return { ok: true, data }
}

export async function logout(refreshToken) {
  const res = await apiFetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'X-Refresh-Token': refreshToken },
  })
<<<<<<< HEAD
  return res.ok || res.status === 204
}
=======

  return res.ok || res.status === 204
}
>>>>>>> 7dbea72 (Second Update)
