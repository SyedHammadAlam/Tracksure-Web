import { ADMIN_API_SECRET } from '../config'
import { apiFetch, parseApiError } from './client'

export async function getAllUsers(accessToken, { page = 0, size = 20, username = '' } = {}) {
  const query = new URLSearchParams()
  query.append('page', page)
  query.append('size', size)
  if (username.trim()) query.append('username', username.trim())
  
  const res = await apiFetch(`/v1/admin/users?${query.toString()}`, { token: accessToken })
  if (!res.ok) {
    return { ok: false, status: res.status, error: await parseApiError(res), data: [] }
  }
  const data = await res.json().catch(() => null)
  return { ok: true, data: Array.isArray(data?.content) ? data.content : [], page: data }
}

export async function fetchAdminUserLocations(secret = ADMIN_API_SECRET) {
  const res = await apiFetch('/api/admin/user-locations', { adminSecret: secret })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res), items: [] }
  }
  const items = await res.json()
  return { ok: true, items: Array.isArray(items) ? items : [] }
}

export async function fetchAllDevices(secret = ADMIN_API_SECRET) {
  const res = await apiFetch('/v1/admin/devices', { adminSecret: secret })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res), items: [] }
  }
  const items = await res.json()
  return { ok: true, items: Array.isArray(items) ? items : [] }
}

export async function fetchAllLocations(secret = ADMIN_API_SECRET) {
  const res = await apiFetch('/v1/location-logs', { adminSecret: secret })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res), items: [] }
  }
  const items = await res.json()
  return { ok: true, items: Array.isArray(items) ? items : [] }
}
