import { ADMIN_API_SECRET } from '../config'
import { apiFetch, parseApiError } from './client'

export async function fetchAdminUserLocations(secret = ADMIN_API_SECRET) {
<<<<<<< HEAD
  const res = await apiFetch('/api/admin/user-locations', { adminSecret: secret })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res), items: [] }
  }
  const items = await res.json()
  return { ok: true, items: Array.isArray(items) ? items : [] }
}
=======
  const res = await apiFetch('/api/admin/user-locations', {
    adminSecret: secret,
  })
  if (!res.ok) {
    return { ok: false, error: await parseApiError(res), items: [] }
  }

  const items = await res.json()
  return { ok: true, items: Array.isArray(items) ? items : [] }
}

console.log("ENV CHECK:", import.meta.env)
>>>>>>> 7dbea72 (Second Update)
