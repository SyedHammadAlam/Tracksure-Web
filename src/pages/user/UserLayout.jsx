import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useStolen } from '../../context/StolenContext'
import ConfigPanel from '../../components/ConfigPanel'
import StolenAlertBanner from '../../components/StolenAlertBanner'
import styles from './UserLayout.module.css'
import { useState } from 'react'

const navItems = [
  { path: '/user/tracking', label: 'My Tracking' },
  { path: '/user/mark-stolen', label: 'Mark as Stolen' },
]

export default function UserLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { isUserDeviceStolen } = useStolen()
  const [configOpen, setConfigOpen] = useState(false)

  const showStolenAlert = user?.role === 'user' && isUserDeviceStolen(user.id)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>TrackSure</span>
          <span className={styles.role}>User Panel</span>
        </div>
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
        <div className={styles.actions}>
          <button type="button" className={styles.configBtn} onClick={() => setConfigOpen(true)}>
            ⚙ Settings
          </button>
          <span className={styles.userName}>{user?.name}</span>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {showStolenAlert && <StolenAlertBanner />}
        <Outlet />
      </main>

      <ConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  )
}
