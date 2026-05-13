import styles from './AdminPanels.module.css'

export default function Heatmap() {
  return (
    <div className={styles.panelCard}>
      <h1 className={styles.title}>Heatmap Analytics</h1>
      <p className={styles.subtitle}>Geographic visualization of device activity and incident reports.</p>

      <div style={{
        marginTop: '3rem',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-panel)',
        border: '1px dashed var(--border)',
        borderRadius: 'var(--radius)',
        color: 'var(--text-muted)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📍</div>
        <h2 style={{ color: 'var(--accent)', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Coming Soon</h2>
        <p style={{ maxWidth: '400px', textAlign: 'center', lineHeight: '1.5' }}>
          We are currently working on a real-time geographic heatmap to help you visualize device density and crime hotspots.
        </p>
      </div>
    </div>
  )
}