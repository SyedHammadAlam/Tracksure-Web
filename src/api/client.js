import { API_BASE_URL } from '../config'

export async function parseApiError(res) {
  const text = await res.text()
  if (!text) return res.statusText || `HTTP ${res.status}`

  try {
    const json = JSON.parse(text)
    return json.message || json.detail || text
  } catch {
    return text
  }
}

export async function apiFetch(
  path,
  { method = 'GET', headers = {}, body, token, adminSecret, on401 } = {},
) {
  const h = new Headers(headers)

  if (body != null && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json')
  }

  if (token) {
    h.set('Authorization', `Bearer ${token}`)
  }

  if (adminSecret) {
    h.set('X-Admin-Secret', adminSecret)
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const res = await fetch(url, {
    method,
    headers: h,
    body: body != null ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  })

  if (res.status === 401 && typeof on401 === 'function') {
    try {
      await on401(res)
    } catch {
      // ignore handler failures, let caller handle the 401
    }
  }

  return res
}

