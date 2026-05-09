import { useEffect, useState, useMemo } from 'react'
import { ADMIN_API_SECRET } from '../../config'
import { fetchAdminUserLocations } from '../../api/adminApi'
import MapPanel from '../../components/MapPanel'
import styles from './AdminPanels.module.css'
import mapStyles from './AdminMap.module.css'

function fallbackCoords(userId) {
  const n = Number(userId) || 0
  return {
    lat: 34.0522 + (n % 7) * 0.015,
    lng: -118.2437 + (n % 5) * 0.018,
  }
}

export default function AllTracking() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const r = await fetchAdminUserLocations(ADMIN_API_SECRET)
      if (cancelled) return
      if (!r.ok) {
        setError(r.error || 'Failed to load users')
        setItems([])
      } else {
        setItems(r.items)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const markers = useMemo(
    () =>
      items.map((row) => {
        const has =
          row.lat != null &&
          row.lng != null &&
          !Number.isNaN(Number(row.lat)) &&
          !Number.isNaN(Number(row.lng))
        const { lat, lng } = has
          ? { lat: Number(row.lat), lng: Number(row.lng) }
          : fallbackCoords(row.userId)
        return {
          id: String(row.userId),
          lat,
          lng,
          label: row.username || String(row.userId),
          title: `${row.username} — ${row.email}`,
        }
      }),
    [items],
  )

  const formatCoords = (row) => {
    if (row.lat != null && row.lng != null) {
      return `${Number(row.lat).toFixed(4)}, ${Number(row.lng).toFixed(4)}`
    }
    return '— (not reported yet)'
  }

  return (
    <div className={styles.panelCard}>
      <h1 className={styles.title}>All Tracking</h1>
      <p className={styles.subtitle}>
        Data from <code>tracksure-be</code> (<code>GET /api/admin/user-locations</code>). Users without a GPS fix yet
        appear at a placeholder offset. Use the same secret as your admin login password by default (
        <code>VITE_ADMIN_API_SECRET</code> / <code>ADMIN_SECRET</code>).
      </p>

      {loading && <p className={styles.empty}>Loading…</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={mapStyles.mapBlock}>
        <h2 className={mapStyles.mapHeading}>Google Map — all users</h2>
        {!loading && items.length === 0 && !error ? (
          <p className={styles.empty}>No registered users in the database.</p>
        ) : items.length > 0 ? (
          <MapPanel markers={markers} fitAll />
        ) : null}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User name</th>
              <th>User ID</th>
              <th>Email</th>
              <th>Location (lat, lng)</th>
              <th>Last location</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  No users.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.userId}>
                  <td>{row.username}</td>
                  <td>{row.userId}</td>
                  <td>{row.email}</td>
                  <td>{formatCoords(row)}</td>
                  <td>
                    {row.lastLocationAt
                      ? new Date(row.lastLocationAt).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
