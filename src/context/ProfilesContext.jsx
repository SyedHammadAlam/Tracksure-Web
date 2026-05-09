import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import * as authApi from '../api/authApi'

const STORAGE_KEY = 'tracksure_profiles'

const defaultCoords = { lat: 34.0522, lng: -118.2437 }

function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveProfiles(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const ProfilesContext = createContext(null)

export function ProfilesProvider({ children }) {
  const [profiles, setProfiles] = useState(loadProfiles)

  const persist = useCallback((list) => {
    setProfiles(list)
    saveProfiles(list)
  }, [])

  const findByUsernameOrId = useCallback(
    (key) => {
      const k = key?.trim()
      if (!k) return undefined
      return profiles.find((p) => p.id === k || p.username === k)
    },
    [profiles],
  )

  const getProfile = useCallback(
    (id) => findByUsernameOrId(id),
    [findByUsernameOrId],
  )

  const getAllProfiles = useCallback(() => profiles, [profiles])

  /** Register via tracksure-be; returns { ok, login?, error? } */
  const registerUser = useCallback(
    async ({ id, username, name, email, phone, password }) => {
      const trimmedId = (username ?? id)?.trim()
      const trimmedEmail = email?.trim()
      if (!trimmedId || !password?.trim()) {
        return { ok: false, error: 'Username and password are required' }
      }
      if (!trimmedEmail) {
        return { ok: false, error: 'Email is required for server registration' }
      }
      if (password.length < 8) {
        return { ok: false, error: 'Password must be at least 8 characters (server rule)' }
      }
      const res = await authApi.register({
        username: trimmedId,
        email: trimmedEmail,
        password,
        confirmPassword: password,
      })
      if (!res.ok) {
        return { ok: false, error: res.error }
      }
      const d = res.data
      const backendId = String(d.userId)
      const next = profiles.filter((p) => p.id !== backendId && p.username !== trimmedId)
      next.push({
        id: backendId,
        username: trimmedId,
        name: name?.trim() || trimmedId,
        email: d.email || trimmedEmail,
        phone: phone?.trim() || '',
        cnic: '',
        imei: '',
        mac: '',
        lat: defaultCoords.lat,
        lng: defaultCoords.lng,
        updatedAt: new Date().toISOString(),
      })
      persist(next)
      return { ok: true, login: d }
    },
    [profiles, persist],
  )

  const verifyUserPassword = useCallback(async (username, password) => {
    const r = await authApi.login({ username: username?.trim(), password })
    if (!r.ok) return { ok: false, error: r.error || 'Invalid credentials' }
    return { ok: true }
  }, [])

  const updateDeviceRegistration = useCallback(
    async ({ id, password, cnic, imei, mac }) => {
      const trimmedId = id?.trim()
      const p = findByUsernameOrId(trimmedId)
      if (!p) return { ok: false, error: 'No profile found. Sign up first.' }
      const v = await verifyUserPassword(trimmedId, password)
      if (!v.ok) return { ok: false, error: v.error }
      const next = profiles.map((x) =>
        x.id === p.id
          ? {
              ...x,
              cnic: cnic?.trim() || x.cnic,
              imei: imei?.trim() || x.imei,
              mac: mac?.trim() || x.mac,
              updatedAt: new Date().toISOString(),
            }
          : x,
      )
      persist(next)
      return { ok: true }
    },
    [profiles, persist, findByUsernameOrId, verifyUserPassword],
  )

  const updateLocation = useCallback(
    (userId, lat, lng) => {
      const next = profiles.map((x) =>
        x.id === userId
          ? { ...x, lat, lng, updatedAt: new Date().toISOString() }
          : x,
      )
      persist(next)
    },
    [profiles, persist],
  )

  /** Merge server /api/me into local device-extras store (creates row if missing). */
  const upsertFromMeResponse = useCallback(
    (me) => {
      const id = String(me.userId)
      const existing = profiles.find((p) => p.id === id)
      const row = {
        id,
        username: me.username,
        name: existing?.name || me.username,
        email: me.email,
        phone: existing?.phone || '',
        cnic: existing?.cnic || '',
        imei: existing?.imei || '',
        mac: existing?.mac || '',
        // Support multiple backend response shapes
        // Expected (older): lastLatitude/lastLongitude/lastLocationAt
        // Possible (newer): latitude/longitude/lastLocationAt, lat/lng, location.{lat,lon}, or nested lastLocation
        lat: (() => {
          const v =
            me?.lastLatitude ??
            me?.latitude ??
            me?.lat ??
            me?.location?.lat ??
            me?.lastLocation?.lat
          return v != null ? Number(v) : existing?.lat ?? defaultCoords.lat
        })(),
        lng: (() => {
          const v =
            me?.lastLongitude ??
            me?.longitude ??
            me?.lng ??
            me?.location?.lon ??
            me?.location?.lng ??
            me?.lastLocation?.lon ??
            me?.lastLocation?.lng
          return v != null ? Number(v) : existing?.lng ?? defaultCoords.lng
        })(),
        updatedAt:
          me?.lastLocationAt ??
          me?.lastLocation?.recordedAt ??
          me?.updatedAt ??
          new Date().toISOString(),
      }
      persist([...profiles.filter((p) => p.id !== id), row])
    },
    [profiles, persist],
  )

  const value = useMemo(
    () => ({
      profiles,
      getProfile,
      getAllProfiles,
      registerUser,
      updateDeviceRegistration,
      updateLocation,
      upsertFromMeResponse,
      verifyUserPassword,
    }),
    [
      profiles,
      getProfile,
      getAllProfiles,
      registerUser,
      updateDeviceRegistration,
      updateLocation,
      upsertFromMeResponse,
      verifyUserPassword,
    ],
  )

  return (
    <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>
  )
}

export function useProfiles() {
  const ctx = useContext(ProfilesContext)
  if (!ctx) throw new Error('useProfiles must be used within ProfilesProvider')
  return ctx
}
