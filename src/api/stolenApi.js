import { apiFetch, parseApiError } from './client'

export async function reportStolenDevice(accessToken, { deviceId, latitude, longitude }) {
  const res = await apiFetch('/api/stolen/report', {
    method: 'POST',
    token: accessToken,
    body: { deviceId, latitude, longitude },
  })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
  return { ok: true }
}

