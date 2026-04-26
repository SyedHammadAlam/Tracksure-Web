import { useState } from 'react'
import styles from './ConfigPanel.module.css'

export default function ConfigPanel({ open, onClose }) {
  const [appearance, setAppearance] = useState('dark')
  const [pow, setPow] = useState('off')

  if (!open) return null

  return (
    <div className={styles.overlay} role="dialog" aria-label="Configuration">
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>configuration</h2>
          <button type="button" className={styles.close} onClick={onClose}>
            Close
          </button>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>appearance</h3>
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={appearance === 'light' ? styles.toggleActive : styles.toggle}
              onClick={() => setAppearance('light')}
            >
              Light
            </button>
            <button
              type="button"
              className={appearance === 'dark' ? styles.toggleActive : styles.toggle}
              onClick={() => setAppearance('dark')}
            >
              Dark
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>proof of work</h3>
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={pow === 'off' ? styles.toggleActive : styles.toggle}
              onClick={() => setPow('off')}
            >
              PoW OFF
            </button>
            <button
              type="button"
              className={pow === 'on' ? styles.toggleActive : styles.toggle}
              onClick={() => setPow('on')}
            >
              PoW ON
            </button>
          </div>
          <p className={styles.hint}>
            add proof of work to geohash messages for spam deterrence.
          </p>
        </section>
      </div>
    </div>
  )
}
