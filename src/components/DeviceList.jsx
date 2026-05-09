import styles from './DeviceList.module.css'

const statusToneMap = {
  ACTIVE: 'ok',
  ONLINE: 'ok',
  LOST: 'warn',
  DISABLED: 'muted',
  OFFLINE: 'muted',
}

function formatTimestamp(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

function normalizeDevice(device) {
  const deviceId = device.deviceId ?? device.id
  const name =
    device.deviceName ||
    device.name ||
    device.peerId ||
    (deviceId != null ? `Device ${deviceId}` : 'Device')
  const status = device.status || (device.isOnline ? 'ONLINE' : 'OFFLINE')
  const peerId = device.peerId
  const lastSeen = device.lastSeenAt || device.lastSeen
  return { deviceId, name, status, peerId, lastSeen }
}

export default function DeviceList({
  devices,
  loading = false,
  error = null,
  title = 'Devices',
}) {
  const list = Array.isArray(devices) ? devices.map(normalizeDevice) : []

  if (loading) {
    return (
      <div className={styles.deviceBox}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.loading}>Loading devices...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.deviceBox}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  if (!list.length) {
    return (
      <div className={styles.deviceBox}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.empty}>No devices found</p>
      </div>
    )
  }

  return (
    <div className={styles.deviceBox}>
      <h3 className={styles.title}>{title} ({list.length})</h3>
      <ul className={styles.deviceList}>
        {list.map((device) => {
          const tone = statusToneMap[device.status] || 'muted'
          const statusClass = styles[`status${tone}`] || styles.statusmuted
          return (
            <li key={device.deviceId || device.peerId || device.name} className={styles.deviceItem}>
              <div className={styles.deviceHeader}>
                <span className={styles.deviceName}>{device.name}</span>
                <span className={`${styles.deviceStatus} ${statusClass}`} aria-label={device.status} />
              </div>
              {device.peerId && (
                <p className={styles.devicePeerId}>Peer: {device.peerId}</p>
              )}
              <p className={styles.deviceTime}>Last seen: {formatTimestamp(device.lastSeen)}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
