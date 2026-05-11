import { Link } from 'react-router-dom'
import styles from './PublicLayout.module.css'

export default function PublicLayout({ children }) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <img src="/assets/tracksure-logo.png" alt="" className={styles.logoImage} />
          <span>TrackSure</span>
        </Link>
        <nav className={styles.nav}>
          <Link to="/signup">Sign Up</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
