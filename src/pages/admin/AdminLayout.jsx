import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ConfigPanel from '../../components/ConfigPanel'
import styles from './AdminLayout.module.css'
import { useState } from 'react'

const navItems = [
  { path: '/admin/dashboard', label: 'All Tracking' },
  { path: '/admin/stolen-requests', label: 'Stolen Requests' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [configOpen, setConfigOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/assets/tracksure-logo.png" alt="" className={styles.logoImage} />
          <span className={styles.logo}>TrackSure</span>
          <span className={styles.role}>Admin Panel</span>
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
        <Outlet />
      </main>

      <ConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  )
}
