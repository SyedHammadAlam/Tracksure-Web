import { apiFetch, parseApiError } from './client'

export async function getMe(accessToken) {
  const res = await apiFetch('/api/me', { token: accessToken })
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

export async function postMyLocation(accessToken, lat, lng) {
  const res = await apiFetch('/api/me/location', {
    method: 'POST',
    token: accessToken,
    body: { lat, lng },
  })
  if (!res.ok && res.status !== 204) {
    return { ok: false, error: await parseApiError(res) }
  }
  return { ok: true }
<<<<<<< HEAD
}
=======
}
>>>>>>> 7dbea72 (Second Update)
