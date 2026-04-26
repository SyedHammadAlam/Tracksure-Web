import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const [mode, setMode] = useState('user') // 'admin' | 'user'
  const [adminPassword, setAdminPassword] = useState('')
  const [userId, setUserId] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [error, setError] = useState('')

  const { loginAsAdmin, loginAsUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || (mode === 'admin' ? '/admin/dashboard' : '/user/tracking')

  const handleAdminSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = loginAsAdmin(adminPassword)
    if (result.ok) navigate(from, { replace: true })
    else setError(result.error || 'Invalid credentials')
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await loginAsUser(userId, userPassword)
    if (result.ok) navigate(from, { replace: true })
    else setError(result.error || 'Invalid credentials')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>TrackSure — Login</h1>
      <p className={styles.hint}>
        New user? <Link to="/signup">Create your profile</Link> on the API. Sign in with your User ID (username) and
        password (8+ characters).
      </p>
      <div className={styles.toggleGroup}>
        <button
          type="button"
          className={mode === 'user' ? styles.toggleActive : styles.toggle}
          onClick={() => { setMode('user'); setError(''); }}
        >
          User
        </button>
        <button
          type="button"
          className={mode === 'admin' ? styles.toggleActive : styles.toggle}
          onClick={() => { setMode('admin'); setError(''); }}
        >
          Admin
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {mode === 'admin' ? (
        <form className={styles.form} onSubmit={handleAdminSubmit}>
          <label className={styles.label}>
            Admin password
            <input
              type="password"
              className={styles.input}
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className={styles.submit}>Sign in as Admin</button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleUserSubmit}>
          <label className={styles.label}>
            User ID
            <input
              type="text"
              className={styles.input}
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className={styles.label}>
            Password
            <input
              type="password"
              className={styles.input}
              placeholder="Password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className={styles.submit}>Sign in as User</button>
        </form>
      )}
    </div>
  )
}
