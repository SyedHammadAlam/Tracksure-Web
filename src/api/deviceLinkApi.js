import { apiFetch, parseApiError } from './client'

async function parseJsonOrNull(res) {
  if (res.status === 204) return null
  return res.json().catch(() => null)
}

function normalizeList(data) {
  return Array.isArray(data) ? data : []
}

export async function createDeviceLink(
  accessToken,
  { targetDeviceId, peerId, deviceName, permissionType = 'TRACK' },
) {
  const body = {
    targetDeviceId: targetDeviceId || null,
    peerId: peerId?.trim() || null,
    deviceName: deviceName?.trim() || null,
    permissionType,
  }
  const res = await apiFetch('/api/device-links', {
    method: 'POST',
    token: accessToken,
    body,
  })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res) }
  }
  return { ok: true, data: await parseJsonOrNull(res) }
}

export async function getTrackedDevices(accessToken) {
  const res = await apiFetch('/api/device-links/tracked', { token: accessToken })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res), data: [] }
  }
  const data = await parseJsonOrNull(res)
  return { ok: true, data: normalizeList(data) }
}

export async function getTrackers(accessToken) {
  const res = await apiFetch('/api/device-links/trackers', { token: accessToken })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res), data: [] }
  }
  const data = await parseJsonOrNull(res)
  return { ok: true, data: normalizeList(data) }
}

export async function updateDeviceLinkPermission(accessToken, linkId, permissionType) {
  const res = await apiFetch(`/api/device-links/${linkId}`, {
    method: 'PATCH',
    token: accessToken,
    body: { permissionType },
  })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res) }
  }
  return { ok: true, data: await parseJsonOrNull(res) }
}

export async function deleteDeviceLink(accessToken, linkId) {
  const res = await apiFetch(`/api/device-links/${linkId}`, {
    method: 'DELETE',
    token: accessToken,
  })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res) }
  }
  return { ok: true }
}
