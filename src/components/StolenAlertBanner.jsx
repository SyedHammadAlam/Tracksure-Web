import styles from './StolenAlertBanner.module.css'

export default function StolenAlertBanner() {
  return (
    <div className={styles.banner} role="alert">
      <span className={styles.icon}>⚠</span>
      <strong>This device has been reported as STOLEN.</strong>
      <span className={styles.text}>Contact admin and authorities. Do not use for sensitive operations.</span>
    </div>
  )
}
