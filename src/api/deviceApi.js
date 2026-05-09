import { apiFetch, parseApiError } from './client'

export async function linkDevice(accessToken, { peerId, deviceName }) {
  const res = await apiFetch('/api/device/link', {
    method: 'POST',
    token: accessToken,
    body: { peerId, deviceName },
  })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
  return { ok: true }
}

export async function getMyDevices(accessToken) {
  const res = await apiFetch('/api/device/me', { token: accessToken })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) }
  }
  return { ok: true, data: await res.json() }
}

