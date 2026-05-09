import { apiFetch, parseApiError } from './client'

export async function getMe(accessToken) {
  const res = await apiFetch('/api/me', { token: accessToken })

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }

  const data = await res.json()
  return { ok: true, data }
}

import { postLocationsBatch } from './locationApi'

export async function postMyLocation(accessToken, lat, lng) {
  // Prefer guide-accurate batching endpoint when possible.
  // Keep legacy /api/me/location fallback for compatibility.
  try {
    const clientBatchUuid = `client-${Date.now()}`
    const points = [{ lat, lon: lng, t: new Date().toISOString() }]
    const subjectPeerId = null
    const uploaderDeviceId = null

    const r = await postLocationsBatch(accessToken, {
      clientBatchUuid,
      subjectPeerId,
      uploaderDeviceId,
      points,
    })
    if (r?.ok) return { ok: true }
  } catch {
    // fall through to legacy endpoint
  }

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


