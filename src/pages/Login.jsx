import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/user/tracking'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(username, password)
    if (result.ok) {
      // Determine redirect based on role (handled via route guards)
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Invalid credentials')
    }
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

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Username
          <input
            type="text"
            className={styles.input}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            type="password"
            className={styles.input}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" className={styles.submit}>Sign in</button>
      </form>
    </div>
  )
}
