import { apiFetch, parseApiError } from './client'

export async function postLocationsBatch(accessToken, {
  clientBatchUuid,
  subjectPeerId,
  uploaderDeviceId,
  points,
}) {
  const payload = {
    clientBatchUuid,
    subjectPeerId,
    uploaderDeviceId,
    points,
  }

  const res = await apiFetch('/v1/locations:batch', {
    method: 'POST',
    token: accessToken,
    body: payload,
  })

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
  return { ok: true }
}

export async function getMyLocations(accessToken) {
  const res = await apiFetch('/v1/location/me', { token: accessToken })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res), data: [] }
  }
  const data = await res.json().catch(() => [])
  return { ok: true, data: Array.isArray(data) ? data : [] }
}

export async function getDeviceLocation(accessToken, deviceId) {
  const res = await apiFetch(`/v1/location/device/${deviceId}`, { token: accessToken })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
  return { ok: true, data: await res.json() }
}

