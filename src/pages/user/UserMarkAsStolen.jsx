import { useEffect, useMemo, useState } from 'react'
import { getMyDevices } from '../../api/deviceApi'
import { getMyLocations } from '../../api/locationApi'
import {
  getMyStolenDevices,
  getStolenDeviceDetails,
  recoverStolenDevice,
  reportStolenDevice,
} from '../../api/stolenApi'
import { useAuth } from '../../context/AuthContext'
import styles from './UserMarkAsStolen.module.css'

function formatTimestamp(value) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

function formatCoords(report) {
  const lat = Number(report?.latitude)
  const lng = Number(report?.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'Not available'
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

function deviceLabel(device) {
  if (!device) return 'Device'
  return device.deviceName || device.name || device.peerId || `Device ${device.deviceId}`
}

export default function UserMarkAsStolen() {
  const { user } = useAuth()
  const token = user?.accessToken

  const [devices, setDevices] = useState([])
  const [locationsByDeviceId, setLocationsByDeviceId] = useState({})
  const [reports, setReports] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [selectedDetails, setSelectedDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recoveringId, setRecoveringId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const selectedDevice = useMemo(
    () => devices.find((device) => String(device.deviceId) === String(selectedDeviceId)),
    [devices, selectedDeviceId],
  )

  const loadData = async () => {
    if (!token) return
    setLoading(true)
    setError('')

    const [devicesRes, locationsRes, reportsRes] = await Promise.all([
      getMyDevices(token),
      getMyLocations(token),
      getMyStolenDevices(token),
    ])

    if (devicesRes.ok) {
      const list = Array.isArray(devicesRes.data) ? devicesRes.data : []
      setDevices(list)
      if (!selectedDeviceId && list[0]?.deviceId != null) {
        setSelectedDeviceId(String(list[0].deviceId))
      }
    } else {
      setDevices([])
      setError(devicesRes.error || 'Failed to load devices.')
    }

    if (locationsRes.ok) {
      const map = {}
      locationsRes.data.forEach((location) => {
        if (location?.subjectDeviceId != null) {
          map[location.subjectDeviceId] = location
        }
      })
      setLocationsByDeviceId(map)
    }

    if (reportsRes.ok) {
      setReports(reportsRes.data)
    } else if (!error) {
      setError(reportsRes.error || 'Failed to load stolen device reports.')
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [token])

  useEffect(() => {
    if (!selectedDeviceId) return
    const location = locationsByDeviceId[selectedDeviceId]
    if (!location) return
    setLatitude(String(location.latitude ?? ''))
    setLongitude(String(location.longitude ?? ''))
  }, [selectedDeviceId, locationsByDeviceId])

  const handleReport = async (event) => {
    event.preventDefault()
    if (!token || saving) return

    setSaving(true)
    setError('')
    setMessage('')

    const result = await reportStolenDevice(token, {
      deviceId: Number(selectedDeviceId),
      latitude: Number(latitude),
      longitude: Number(longitude),
    })

    if (result.ok) {
      setMessage('Device reported as stolen.')
      setSelectedDetails(result.data)
      await loadData()
    } else {
      setError(result.error || 'Failed to report stolen device.')
    }

    setSaving(false)
  }

  const handleDetails = async (deviceId) => {
    if (!token) return
    setError('')
    const result = await getStolenDeviceDetails(token, deviceId)
    if (result.ok) {
      setSelectedDetails(result.data)
    } else {
      setError(result.error || 'Failed to load report details.')
    }
  }

  const handleRecover = async (deviceId) => {
    if (!token || recoveringId) return
    setRecoveringId(deviceId)
    setError('')
    setMessage('')

    const result = await recoverStolenDevice(token, deviceId)
    if (result.ok) {
      setMessage('Device marked as recovered.')
      setSelectedDetails(result.data)
      await loadData()
    } else {
      setError(result.error || 'Failed to mark device as recovered.')
    }

    setRecoveringId(null)
  }

  return (
    <div className={styles.page}>
      <section className={styles.panelCard}>
        <h1 className={styles.title}>Stolen Device Report</h1>
        <p className={styles.subtitle}>
          Report a lost or stolen device using its latest known coordinates. The backend stores the report and geocodes
          the location automatically.
        </p>

        {error && <p className={styles.formError}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}

        <form className={styles.form} onSubmit={handleReport}>
          <label className={styles.label}>
            Device
            <select
              className={styles.input}
              value={selectedDeviceId}
              onChange={(event) => setSelectedDeviceId(event.target.value)}
              disabled={loading || saving}
              required
            >
              <option value="">Select device</option>
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {deviceLabel(device)}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.grid}>
            <label className={styles.label}>
              Latitude
              <input
                type="number"
                step="any"
                className={styles.input}
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                required
              />
            </label>
            <label className={styles.label}>
              Longitude
              <input
                type="number"
                step="any"
                className={styles.input}
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                required
              />
            </label>
          </div>

          <button type="submit" className={styles.submit} disabled={loading || saving || !selectedDeviceId}>
            {saving ? 'Reporting...' : 'Report stolen'}
          </button>
        </form>

        {selectedDevice && (
          <p className={styles.message}>
            Selected: {deviceLabel(selectedDevice)}
            {selectedDevice.peerId ? `, peer ${selectedDevice.peerId}` : ''}
          </p>
        )}
      </section>

      <section className={styles.panelCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>My Stolen Reports</h2>
            <p className={styles.subtitle}>Active and recovered reports from `/api/stolen/my-devices`.</p>
          </div>
          <button type="button" className={styles.secondaryBtn} onClick={loadData} disabled={loading}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p className={styles.message}>Loading reports...</p>
        ) : reports.length ? (
          <ul className={styles.reportList}>
            {reports.map((report) => (
              <li key={report.id || report.deviceId} className={styles.reportItem}>
                <div>
                  <strong>Device {report.deviceId}</strong>
                  <p>{report.formattedAddress || report.city || formatCoords(report)}</p>
                  <small>Reported {formatTimestamp(report.timestamp || report.createdAt)}</small>
                </div>
                <div className={styles.reportActions}>
                  <span className={report.isRecovered ? styles.recoveredBadge : styles.activeBadge}>
                    {report.isRecovered ? 'Recovered' : 'Active'}
                  </span>
                  <button type="button" className={styles.secondaryBtn} onClick={() => handleDetails(report.deviceId)}>
                    Details
                  </button>
                  {!report.isRecovered && (
                    <button
                      type="button"
                      className={styles.submitSmall}
                      onClick={() => handleRecover(report.deviceId)}
                      disabled={recoveringId === report.deviceId}
                    >
                      {recoveringId === report.deviceId ? 'Recovering...' : 'Recover'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.message}>No stolen device reports yet.</p>
        )}
      </section>

      {selectedDetails && (
        <section className={styles.panelCard}>
          <h2 className={styles.sectionTitle}>Report Details</h2>
          <dl className={styles.detailsList}>
            <div>
              <dt>Device</dt>
              <dd>{selectedDetails.deviceId}</dd>
            </div>
            <div>
              <dt>Coordinates</dt>
              <dd>{formatCoords(selectedDetails)}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{selectedDetails.formattedAddress || 'Not available'}</dd>
            </div>
            <div>
              <dt>City</dt>
              <dd>{selectedDetails.city || 'Not available'}</dd>
            </div>
            <div>
              <dt>Reported</dt>
              <dd>{formatTimestamp(selectedDetails.timestamp || selectedDetails.createdAt)}</dd>
            </div>
            <div>
              <dt>Recovery</dt>
              <dd>{selectedDetails.isRecovered ? formatTimestamp(selectedDetails.recoveryTimestamp) : 'Not recovered'}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  )
}
