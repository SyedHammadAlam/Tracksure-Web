import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfiles } from '../context/ProfilesContext'
import styles from './Auth.module.css'

export default function SignUp() {
  const { registerUser } = useProfiles()
  const { applySessionFromLoginResponse } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [id, setId] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await registerUser({
        id,
        name,
        email,
        phone,
        password,
      })
      if (!result.ok) {
        setError(result.error || 'Could not register')
        return
      }
      if (result.login) {
        applySessionFromLoginResponse(result.login, { displayName: name })
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
      <h1 className={styles.title}>Sign Up — Create profile</h1>
      <p className={styles.lead}>
        Account is created on the <strong>TrackSure API</strong> (tracksure-be). Password must be at least 8
        characters. You can add device details on <Link to="/registration">Registration</Link> before or after
        sign-in.
      </p>
      {error && <p className={styles.error}>{error}</p>}
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Name
          <input
            type="text"
            className={styles.input}
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          User ID
          <input
            type="text"
            className={styles.input}
            placeholder="Unique login ID (maps to server username)"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            minLength={3}
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
          Phone
          <input
            type="tel"
            className={styles.input}
            placeholder="Phone number (stored locally only)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Creating…' : 'Create profile & sign in'}
        </button>
      </form>
    </div>
  )
}
