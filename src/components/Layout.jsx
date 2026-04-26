import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ConfigPanel from './ConfigPanel'
import styles from './Layout.module.css'

const navItems = [
  { path: '/device-location', label: 'Device Location' },
  { path: '/mark-stolen', label: 'Mark as Stolen' },
  { path: '/login', label: 'Login' },
  { path: '/signup', label: 'Sign Up' },
  { path: '/registration', label: 'Registration' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const [configOpen, setConfigOpen] = useState(false)

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>TrackSure</Link>
        <nav className={styles.nav}>
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={location.pathname === path ? styles.navActive : styles.navLink}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className={styles.configTrigger}
          onClick={() => setConfigOpen((o) => !o)}
          aria-label="Settings"
        >
          ⚙ Settings
        </button>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <ConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  )
}
