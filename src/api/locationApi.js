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

