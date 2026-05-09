import { apiFetch, parseApiError } from './client'

export async function checkSafetyArea(accessToken, { lat, lon }) {
  const url = `/api/safety/check-area?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
  const res = await apiFetch(url, { token: accessToken })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
  return { ok: true, data: await res.json().catch(() => null) }
}

