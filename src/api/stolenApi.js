import { apiFetch, parseApiError } from './client'

export async function reportStolenDevice(accessToken, { deviceId, latitude, longitude }) {
  const res = await apiFetch('/api/stolen/report', {
    method: 'POST',
    token: accessToken,
    body: { deviceId, latitude, longitude },
  })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res) }
  }
  return { ok: true, data: await res.json().catch(() => null) }
}

export async function getMyStolenDevices(accessToken, { page = 0, size = 20 } = {}) {
  const res = await apiFetch(`/api/stolen/my-devices?page=${page}&size=${size}`, { token: accessToken })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res), data: [] }
  }
  const data = await res.json().catch(() => null)
  return { ok: true, data: Array.isArray(data?.content) ? data.content : [], page: data }
}

export async function getStolenDeviceDetails(accessToken, deviceId) {
  const res = await apiFetch(`/api/stolen/details/${deviceId}`, { token: accessToken })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res) }
  }
  return { ok: true, data: await res.json().catch(() => null) }
}

export async function recoverStolenDevice(accessToken, deviceId) {
  const res = await apiFetch(`/api/stolen/recover/${deviceId}`, {
    method: 'PATCH',
    token: accessToken,
  })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res) }
  }
  return { ok: true, data: await res.json().catch(() => null) }
}

export async function getAdminStolenReportsGrouped(accessToken, { page = 0, size = 20 } = {}) {
  const res = await apiFetch(`/api/stolen/admin/reports-by-user?page=${page}&size=${size}`, { token: accessToken })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res), data: [] }
  }
  const data = await res.json().catch(() => null)
  return { ok: true, data: Array.isArray(data?.content) ? data.content : [], page: data }
}

