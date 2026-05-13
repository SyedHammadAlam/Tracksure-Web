import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminLayout.module.css'

const navItems = [
  { path: '/admin/stolen-requests', label: 'Stolen Requests' },
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/stolen-reports', label: 'Stolen Reports' },
  { path: '/admin/heatmap', label: 'Heatmap' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

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
          <Link
            to="/admin/settings"
            className={location.pathname === '/admin/settings' ? styles.navActive : styles.configBtn}
          >
            Settings
          </Link>
          <span className={styles.userName}>{user?.name}</span>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
