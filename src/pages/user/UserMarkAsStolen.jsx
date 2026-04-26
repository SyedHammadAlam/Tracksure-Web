import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProfiles } from '../../context/ProfilesContext'
import { useStolen } from '../../context/StolenContext'
import styles from './UserMarkAsStolen.module.css'

export default function UserMarkAsStolen() {
  const { user } = useAuth()
  const { verifyUserPassword } = useProfiles()
  const { addRequest } = useStolen()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [cnic, setCnic] = useState('')
  const [password, setPassword] = useState('')
  const [deviceName, setDeviceName] = useState(`${user?.name || 'User'}'s Device`)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const loginUsername = user?.username || user?.name

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!loginUsername) {
      setFormError('Session missing username. Please log in again.')
      return
    }
    setLoading(true)
    try {
      const check = await verifyUserPassword(loginUsername, password)
      if (!check.ok) {
        setFormError(check.error || 'Invalid password')
        return
      }
      addRequest({
        userId: user.id,
        userName: name.trim() || user.name,
        deviceName: deviceName.trim() || 'Device',
        cnic: cnic.trim(),
      })
      setSubmitted(true)
      setTimeout(() => navigate('/user/tracking'), 2000)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={styles.panelCard}>
        <h1 className={styles.title}>Request Submitted</h1>
        <p className={styles.message}>
          Your &quot;Mark as Stolen&quot; request has been sent to the admin. You will see an alert on your screen once the admin approves it.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.panelCard}>
      <h1 className={styles.title}>Mark as Stolen</h1>
      <p className={styles.subtitle}>
        Submit a request to report your device as stolen. The admin will review and approve; once approved, an alert will appear on your screen.
      </p>
      {formError && <p className={styles.formError}>{formError}</p>}
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Name
          <input type="text" className={styles.input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className={styles.label}>
          Device name
          <input type="text" className={styles.input} placeholder="Device name" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
        </label>
        <label className={styles.label}>
          CNIC
          <input type="text" className={styles.input} placeholder="CNIC number" value={cnic} onChange={(e) => setCnic(e.target.value)} />
        </label>
        <label className={styles.label}>
          Password
          <input
            type="password"
            className={styles.input}
            placeholder="Your account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Checking…' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}
