import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useStolen } from '../../context/StolenContext'
import StolenAlertBanner from '../../components/StolenAlertBanner'
import styles from './UserLayout.module.css'

const navItems = [
  { path: '/user/tracking', label: 'My Tracking' },
  { path: '/user/mark-stolen', label: 'Stolen Devices' },
]

export default function UserLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { isUserDeviceStolen } = useStolen()

  const showStolenAlert = user?.role === 'user' && isUserDeviceStolen(user.id)

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
          <Link
            to="/user/settings"
            className={location.pathname === '/user/settings' ? styles.configActive : styles.configBtn}
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
        {showStolenAlert && <StolenAlertBanner />}
        <Outlet />
      </main>
    </div>
  )
}
