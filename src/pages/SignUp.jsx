import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfiles } from '../context/ProfilesContext'
import styles from './Auth.module.css'

export default function SignUp() {
  const { registerUser } = useProfiles()
  const { applySessionFromLoginResponse } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const result = await registerUser({
        username,
        email,
        password,
      })
      if (!result.ok) {
        setError(result.error || 'Could not register')
        return
      }
      if (result.login) {
        applySessionFromLoginResponse(result.login)
        navigate('/user/tracking', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.authBrand}>
        <img src="/assets/tracksure-logo.png" alt="TrackSure logo" className={styles.authLogo} />
        <h1 className={styles.title}>Create TrackSure Profile</h1>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Username
          <input
            type="text"
            className={styles.input}
            placeholder="Unique username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            autoComplete="username"
          />
        </label>
        <label className={styles.label}>
          Email
          <input
            type="email"
            className={styles.input}
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            type="password"
            className={styles.input}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label className={styles.label}>
          Confirm password
          <input
            type="password"
            className={styles.input}
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Creating...' : 'Create profile & sign in'}
        </button>
      </form>
    </div>
  )
}
