import { apiFetch, parseApiError } from './client'

export async function getProfile(accessToken) {
  const res = await apiFetch('/api/profile/me', { token: accessToken })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res) }
  }
  return { ok: true, data: await res.json() }
}

export async function createProfile(accessToken, { fullName, phoneNumber, bio, profilePic }) {
  const res = await apiFetch('/api/profile', {
    method: 'POST',
    token: accessToken,
    body: { fullName, phoneNumber, bio, profilePic },
  })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res) }
  }
  return { ok: true, data: await res.json() }
}

export async function updateProfile(accessToken, { fullName, phoneNumber, bio, profilePic }) {
  const res = await apiFetch('/api/profile/me', {
    method: 'PUT',
    token: accessToken,
    body: { fullName, phoneNumber, bio, profilePic },
  })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res) }
  }
  // backend may return updated profile or 204; handle both
  if (res.status === 204) return { ok: true }
  return { ok: true, data: await res.json() }
}


