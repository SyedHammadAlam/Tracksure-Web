import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const [mode, setMode] = useState('user') // 'admin' | 'user'
  const [adminPassword, setAdminPassword] = useState('')
  const [username, setUsername] = useState('')
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
    const result = await loginAsUser(username, userPassword)
    if (result.ok) navigate(from, { replace: true })
    else setError(result.error || 'Invalid credentials')
  }

  return (
    <div className={styles.page}>
      <div className={styles.authBrand}>
        <img src="/assets/tracksure-logo.png" alt="TrackSure logo" className={styles.authLogo} />
        <h1 className={styles.title}>TrackSure Login</h1>
      </div>
      <p className={styles.hint}>
        New user? <Link to="/signup">Create your profile</Link> on the API. Sign in with your username and password.
      </p>
      <div className={styles.toggleGroup}>
        <button
          type="button"
          className={mode === 'user' ? styles.toggleActive : styles.toggle}
          onClick={() => { setMode('user'); setError('') }}
        >
          User
        </button>
        <button
          type="button"
          className={mode === 'admin' ? styles.toggleActive : styles.toggle}
          onClick={() => { setMode('admin'); setError('') }}
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
            Username
            <input
              type="text"
              className={styles.input}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
