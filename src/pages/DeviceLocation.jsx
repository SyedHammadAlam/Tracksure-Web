import { useState } from 'react'
import styles from './DeviceLocation.module.css'

const MOCK = {
  deviceName: 'My Sentinel Phone',
  time: '2025-11-12 09:58:30 GMT',
  location: 'Latitude: 34.0522, Longitude: -118.2437 (Los Angeles, CA)',
  status: 'Secure / Online',
}

const MOCK_REPORT = [
  { time: '09:00', text: 'Device Check-in - Secure' },
  { time: '06:30', text: 'Alert: High-risk proximity detected (No change in route)', alert: true },
  { time: '00:00', text: 'Device Check-in - Secure' },
]

export default function DeviceLocation() {
  const [reportExpanded, setReportExpanded] = useState(true)

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Device Location & Security</h1>

      {/* A. Device Tracking Panel */}
      <section className={styles.trackingPanel}>
        <h2 className={styles.panelTitle}>Device Tracking Panel</h2>
        <dl className={styles.dataList}>
          <div className={styles.dataRow}>
            <dt>Device Name</dt>
            <dd>{MOCK.deviceName}</dd>
          </div>
          <div className={styles.dataRow}>
            <dt>Time</dt>
            <dd>{MOCK.time}</dd>
          </div>
          <div className={styles.dataRow}>
            <dt>Location</dt>
            <dd>{MOCK.location}</dd>
          </div>
          <div className={styles.dataRow}>
            <dt>Status</dt>
            <dd className={styles.statusSecure}>{MOCK.status}</dd>
          </div>
        </dl>
      </section>

      {/* B. Map and Alert Section */}
      <section className={styles.mapSection}>
        <div className={styles.mapPlaceholder}>
          <div className={styles.mapGrid} aria-hidden />
          <div className={styles.heatMapLabel}>Crime Heat Map (Mock Visualization)</div>
          <div className={styles.heatDots}>
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className={styles.heatDot}
                style={{
                  left: `${15 + (i % 6) * 14 + Math.random() * 4}%`,
                  top: `${20 + Math.floor(i / 6) * 15 + Math.random() * 5}%`,
                  opacity: 0.4 + Math.random() * 0.5,
                }}
              />
            ))}
          </div>
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
      </section>

      {/* C. SOS Feature */}
      <section className={styles.sosSection}>
        <button type="button" className={styles.sosButton}>
          SOS (Send Security Alert)
        </button>
      </section>
    </div>
  )
}
