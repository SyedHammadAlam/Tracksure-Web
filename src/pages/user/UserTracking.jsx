import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfiles } from '../../context/ProfilesContext'
import { getMe, postMyLocation, getMyDevices, getMyLocations } from '../../api/meApi'
import MapPanel from '../../components/MapPanel'
import DeviceList from '../../components/DeviceList'
import styles from '../DeviceLocation.module.css'

const MOCK_REPORT = [
  { time: '09:00', text: 'Device Check-in - Secure' },
  { time: '06:30', text: 'Alert: High-risk proximity detected (No change in route)', alert: true },
  { time: '00:00', text: 'Device Check-in - Secure' },
]

function formatTime(iso) {
  if (!iso) return '—'
  try {
    const d = typeof iso === 'string' ? new Date(iso) : new Date(iso)
    return Number.isNaN(d.getTime()) ? String(iso) : d.toUTCString()
  } catch {
    return String(iso)
  }
}

export default function UserTracking() {
  const { user } = useAuth()
  const { getProfile, updateLocation, upsertFromMeResponse } = useProfiles()
  const [reportExpanded, setReportExpanded] = useState(true)
  const [geoStatus, setGeoStatus] = useState('')
  const [apiStatus, setApiStatus] = useState('')
  const [devices, setDevices] = useState([])
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [devicesError, setDevicesError] = useState('')

  const profile = user?.id ? getProfile(user.id) : null
  const token = user?.accessToken

  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      const r = await getMe(token)
      if (cancelled) return
      if (r.ok) {
        upsertFromMeResponse(r.data)
        setApiStatus('Synced account from server.')
      } else {
        setApiStatus(`Could not load /api/me: ${r.error}`)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, upsertFromMeResponse])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      setDevicesLoading(true)
      setDevicesError('')
      const devicesRes = await getMyDevices(token)
      if (cancelled) return
      if (devicesRes.ok) {
        setDevices(Array.isArray(devicesRes.data) ? devicesRes.data : [])
      } else {
        setDevicesError(devicesRes.error || 'Failed to load devices')
        setDevices([])
      }
      setDevicesLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  // Location display comes from backend (server /api/me via getMe + upsertFromMeResponse)
  // (UserTracking renders lat/lng from ProfilesContext, which is updated after getMe.)
  useEffect(() => {
    if (!token) return
    setGeoStatus('Loading location from server…')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const displayName = profile?.name || user?.name || 'User'

  const deviceName = `${displayName}'s Device`
  const time = formatTime(profile?.updatedAt)
  const lat = profile?.lat ?? 34.0522
  const lng = profile?.lng ?? -118.2437
  const locationStr = `Latitude: ${Number(lat).toFixed(4)}, Longitude: ${Number(lng).toFixed(4)}`
  const status = 'Secure / Online'

  const markers = useMemo(
    () => [
      {
        id: user?.id || 'me',
        lat: Number(lat),
        lng: Number(lng),
        label: 'You',
        title: `${displayName} (${user?.username || user?.id})`,
      },
    ],
    [user?.id, user?.username, lat, lng, displayName],
  )

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>My Tracking</h1>
      <p className={styles.mapNote}>
        This map shows <strong>only your</strong> device location. Position is saved to the server when you allow
        location access.
      </p>
      {apiStatus && <p className={styles.geoHint}>{apiStatus}</p>}
      {geoStatus && <p className={styles.geoHint}>{geoStatus}</p>}

      <section className={styles.trackingPanel}>
        <h2 className={styles.panelTitle}>Device Tracking Panel</h2>
        <dl className={styles.dataList}>
          <div className={styles.dataRow}>
            <dt>Device Name</dt>
            <dd>{deviceName}</dd>
          </div>
          <div className={styles.dataRow}>
            <dt>Time</dt>
            <dd>{time}</dd>
          </div>
          <div className={styles.dataRow}>
            <dt>Location</dt>
            <dd>{locationStr}</dd>
          </div>
          <div className={styles.dataRow}>
            <dt>Status</dt>
            <dd className={styles.statusSecure}>{status}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.mapSection}>
        <div className={styles.mapContainer}>
          <div className={styles.mapWrapper}>
            <h2 className={styles.mapSectionTitle}>Live location (Google Maps)</h2>
            <div className={styles.mapFrame}>
              <MapPanel markers={markers} fitAll={false} />
            </div>

            <div className={styles.securityScore}>
              <span className={styles.scoreLabel}>Security Score:</span>
              <span className={styles.scoreValue}>85/100</span>
              <span className={styles.riskBadge}>(LOW Risk)</span>
            </div>

            <div className={styles.reportSection}>
              <button
                type="button"
                className={styles.reportToggle}
                onClick={() => setReportExpanded((e) => !e)}
                aria-expanded={reportExpanded}
              >
                12 Hour Update Report {reportExpanded ? '▼' : '▶'}
              </button>
              {reportExpanded && (
                <ul className={styles.reportLog}>
                  {MOCK_REPORT.map((entry, i) => (
                    <li key={i} className={entry.alert ? styles.reportAlert : styles.reportItem}>
                      <span className={styles.reportTime}>{entry.time}:</span> {entry.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className={styles.sidePanel}>
            <DeviceList
              devices={devices}
              loading={devicesLoading}
              error={devicesError}
            />
          </div>
        </div>
      </section>

      <section className={styles.sosSection}>
        <button type="button" className={styles.sosButton}>
          SOS (Send Security Alert)
        </button>
      </section>
    </div>
  )
}
