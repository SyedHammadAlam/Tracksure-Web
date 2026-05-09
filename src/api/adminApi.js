import { ADMIN_API_SECRET } from '../config'
import { apiFetch, parseApiError } from './client'

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
