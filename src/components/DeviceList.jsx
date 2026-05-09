import styles from './DeviceList.module.css'

export default function DeviceList({ devices, loading = false, error = null }) {
  if (loading) {
    return (
      <div className={styles.deviceBox}>
        <h3 className={styles.title}>My Devices</h3>
        <p className={styles.loading}>Loading devices…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.deviceBox}>
        <h3 className={styles.title}>My Devices</h3>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  if (!devices || devices.length === 0) {
    return (
      <div className={styles.deviceBox}>
        <h3 className={styles.title}>My Devices</h3>
        <p className={styles.empty}>No devices found</p>
      </div>
    )
  }

  return (
    <div className={styles.deviceBox}>
      <h3 className={styles.title}>Devices ({devices.length})</h3>
      <ul className={styles.deviceList}>
        {devices.map((device) => (
          <li key={device.id || device.peerId} className={styles.deviceItem}>
            <div className={styles.deviceHeader}>
              <span className={styles.deviceName}>{device.name || device.peerId}</span>
              <span className={styles.deviceStatus}>
                {device.isOnline ? '🟢' : '🔴'}
              </span>
            </div>
            {device.peerId && (
              <p className={styles.devicePeerId}>ID: {device.peerId.substring(0, 12)}…</p>
            )}
            {device.lastSeen && (
              <p className={styles.deviceTime}>
                Last seen: {new Date(device.lastSeen).toLocaleTimeString()}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
