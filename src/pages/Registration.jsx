import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfiles } from '../context/ProfilesContext'
import styles from './Auth.module.css'

export default function Registration() {
  const { updateDeviceRegistration } = useProfiles()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [cnic, setCnic] = useState('')
  const [imei, setImei] = useState('')
  const [mac, setMac] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await updateDeviceRegistration({
        id: userId,
        password,
        cnic,
        imei,
        mac,
      })
      if (!result.ok) {
        setError(result.error || 'Update failed')
        return
      }
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Registration (device details)</h1>
      <p className={styles.lead}>
        Use the same <strong>User ID</strong> and <strong>password</strong> as on the server. Details are saved in
        this browser only (CNIC / IMEI / MAC).
      </p>
      {error && <p className={styles.error}>{error}</p>}
      {success && (
        <p className={styles.success}>
          Device details saved. You can now <Link to="/login">log in</Link> or continue if already signed in.
        </p>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          User ID
          <input
            type="text"
            className={styles.input}
            placeholder="Your Sign Up User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            type="password"
            className={styles.input}
            placeholder="Your account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <label className={styles.label}>
          CNIC
          <input
            type="text"
            className={styles.input}
            placeholder="CNIC number"
            value={cnic}
            onChange={(e) => setCnic(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          IMEI
          <input
            type="text"
            className={styles.input}
            placeholder="Device IMEI"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          MAC address
          <input
            type="text"
            className={styles.input}
            placeholder="MAC address"
            value={mac}
            onChange={(e) => setMac(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          Photo
          <div className={styles.uploadPlaceholder}>
            <span>Upload placeholder</span>
            <input type="file" accept="image/*" className={styles.fileInput} />
          </div>
        </label>
        <button type="submit" className={styles.submit} disabled={success || loading}>
          {loading ? 'Saving…' : 'Save device registration'}
        </button>
      </form>
    </div>
  )
}
