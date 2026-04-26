import { useStolen } from '../../context/StolenContext'
import styles from './AdminPanels.module.css'

export default function StolenRequests() {
  const { requests, approveRequest, rejectRequest } = useStolen()

  const pending = requests.filter((r) => r.status === 'pending')
  const resolved = requests.filter((r) => r.status !== 'pending')

  return (
    <div className={styles.panelCard}>
      <h1 className={styles.title}>Stolen Requests</h1>
      <p className={styles.subtitle}>User-reported stolen devices. Approve to mark as stolen (user will see an alert).</p>

      {pending.length === 0 && resolved.length === 0 && (
        <p className={styles.empty}>No stolen requests yet.</p>
      )}

      {pending.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pending</h2>
          <ul className={styles.requestList}>
            {pending.map((req) => (
              <li key={req.id} className={styles.requestItem}>
                <div className={styles.requestInfo}>
                  <strong>{req.deviceName}</strong> — {req.userName} (ID: {req.userId})
                  {req.cnic && <span className={styles.meta}> · CNIC: {req.cnic}</span>}
                  <span className={styles.date}>{new Date(req.requestedAt).toLocaleString()}</span>
                </div>
                <div className={styles.requestActions}>
                  <button type="button" className={styles.approveBtn} onClick={() => approveRequest(req.id)}>
                    Approve
                  </button>
                  <button type="button" className={styles.rejectBtn} onClick={() => rejectRequest(req.id)}>
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {resolved.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Resolved</h2>
          <ul className={styles.requestList}>
            {resolved.map((req) => (
              <li key={req.id} className={styles.requestItem}>
                <div className={styles.requestInfo}>
                  <strong>{req.deviceName}</strong> — {req.userName} (ID: {req.userId})
                  <span className={req.status === 'approved' ? styles.badgeApproved : styles.badgeRejected}>
                    {req.status}
                  </span>
                  <span className={styles.date}>{new Date(req.requestedAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
