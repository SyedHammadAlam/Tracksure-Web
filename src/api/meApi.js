import { apiFetch, parseApiError } from './client'

export async function getMe(accessToken) {
  // Backwards-compatible endpoint used by current UI
  const res = await apiFetch('/api/me', { token: accessToken })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
  const data = await res.json()
  return { ok: true, data }
}

export async function postMyLocation(accessToken, lat, lng) {
  // Backwards-compatible endpoint used by current UI.
  // Guide-accurate batching endpoint lives in locationApi.js (POST /v1/locations:batch)
  const res = await apiFetch('/api/me/location', {
    method: 'POST',
    token: accessToken,
    body: { lat, lng },
  })
  if (!res.ok && res.status !== 204) {
    return { ok: false, error: await parseApiError(res) }
  }
  return { ok: true }
}


export async function getMyDevices(accessToken) {
  // Backwards-compatible endpoint used by current UI.
  // Guide-accurate device endpoints live in deviceApi.js
  const res = await apiFetch('/api/device/me', { token: accessToken })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
  const data = await res.json()
  return { ok: true, data }
}

export async function getMyLocations(accessToken) {
  // Backwards-compatible endpoint used by current UI.
  const res = await apiFetch('/v1/location/me', { token: accessToken })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
  const data = await res.json()
  return { ok: true, data }
}

