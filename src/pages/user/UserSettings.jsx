import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as profileApi from '../../api/profileApi'
import { useAuth } from '../../context/AuthContext'
import styles from './UserSettings.module.css'

const NICKNAME_KEY = 'tracksure_nickname'
const THEME_KEY = 'tracksure_theme'

function clean(value) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function initials(name) {
  const source = name?.trim() || 'U'
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function UserSettings() {
  const navigate = useNavigate()
  const { user, logout, updateCurrentUser } = useAuth()
  const token = user?.accessToken
  const [profileExists, setProfileExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    bio: '',
    profilePic: '',
    nickname: localStorage.getItem(NICKNAME_KEY) || user?.name || user?.username || '',
  })

  const displayName = useMemo(
    () => form.fullName.trim() || form.nickname.trim() || user?.username || 'TrackSure User',
    [form.fullName, form.nickname, user?.username],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    let alive = true

    async function loadProfile() {
      if (!token) {
        setLoading(false)
        setError('Sign in required.')
        return
      }

      setLoading(true)
      setError('')
      const result = await profileApi.getProfile(token)

      if (!alive) return

      if (result.ok) {
        const profile = result.data || {}
        setProfileExists(true)
        setForm((current) => ({
          ...current,
          fullName: profile.fullName || '',
          phoneNumber: profile.phoneNumber || '',
          bio: profile.bio || '',
          profilePic: profile.profilePic || '',
        }))
      } else if (result.status === 404) {
        setProfileExists(false)
      } else {
        setError(result.error || 'Profile fetch failed.')
      }
      setLoading(false)
    }

    loadProfile()
    return () => {
      alive = false
    }
  }, [token])

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setMessage('')
    setError('')
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!token) return

    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      fullName: clean(form.fullName),
      phoneNumber: clean(form.phoneNumber),
      bio: clean(form.bio),
      profilePic: clean(form.profilePic),
    }

    const primary = profileExists
      ? await profileApi.updateProfile(token, payload)
      : await profileApi.createProfile(token, payload)

    const result =
      profileExists && primary.status === 404
        ? await profileApi.createProfile(token, payload)
        : primary

    if (result.ok) {
      const saved = result.data || payload
      const nickname = form.nickname.trim() || user?.username || ''
      localStorage.setItem(NICKNAME_KEY, nickname)
      setProfileExists(true)
      setForm((current) => ({
        ...current,
        fullName: saved.fullName || current.fullName,
        phoneNumber: saved.phoneNumber || current.phoneNumber,
        bio: saved.bio || current.bio,
        profilePic: saved.profilePic || current.profilePic,
        nickname,
      }))
      updateCurrentUser?.({ name: saved.fullName || nickname || user?.username })
      setMessage('Profile saved.')
    } else {
      setError(result.error || 'Profile save failed.')
    }

    setSaving(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className={styles.settingsPage}>
      <div className={styles.headingRow}>
        <div>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Account details, editable profile info, and app settings.</p>
        </div>
        <div className={styles.avatar} aria-hidden="true">
          {initials(displayName)}
        </div>
      </div>

      <div className={styles.grid}>
        <aside className={styles.accountCard}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <dl className={styles.infoList}>
            <div>
              <dt>Username</dt>
              <dd>{user?.username || 'Unknown user'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email || 'Not available'}</dd>
            </div>
            <div>
              <dt>User ID</dt>
              <dd>{user?.id || 'Not available'}</dd>
            </div>
          </dl>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <form className={styles.profileCard} onSubmit={handleSave}>
          <div className={styles.formHeader}>
            <h2 className={styles.sectionTitle}>Profile</h2>
            {loading && <span className={styles.status}>Loading...</span>}
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}

          <label className={styles.label}>
            Full name
            <input
              className={styles.input}
              value={form.fullName}
              onChange={updateField('fullName')}
              disabled={loading || saving}
              placeholder="Your full name"
            />
          </label>

          <label className={styles.label}>
            Phone number
            <input
              className={styles.input}
              value={form.phoneNumber}
              onChange={updateField('phoneNumber')}
              disabled={loading || saving}
              placeholder="Phone number"
              inputMode="tel"
            />
          </label>

          <label className={styles.label}>
            Bio
            <textarea
              className={styles.textarea}
              value={form.bio}
              onChange={updateField('bio')}
              disabled={loading || saving}
              placeholder="Short profile bio"
              rows={4}
            />
          </label>

          <label className={styles.label}>
            Nickname
            <input
              className={styles.input}
              value={form.nickname}
              onChange={updateField('nickname')}
              disabled={loading || saving}
              placeholder="Display nickname"
            />
          </label>

          <label className={styles.label}>
            Profile photo URL
            <input
              className={styles.input}
              value={form.profilePic}
              onChange={updateField('profilePic')}
              disabled={loading || saving}
              placeholder="https://..."
            />
          </label>

          <div className={styles.settingsList}>
            <h2 className={styles.sectionTitle}>More Settings</h2>
            <div className={styles.settingItem}>
              <span>Appearance</span>
              <div className={styles.toggleGroup} aria-label="Appearance mode">
                <button
                  type="button"
                  className={theme === 'light' ? styles.toggleActive : styles.toggle}
                  onClick={() => setTheme('light')}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={theme === 'dark' ? styles.toggleActive : styles.toggle}
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </button>
              </div>
            </div>
            <div className={styles.settingItem}>
              <span>Privacy controls</span>
              <small>Coming soon</small>
            </div>
            <div className={styles.settingItem}>
              <span>Notification preferences</span>
              <small>Coming soon</small>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={() => navigate('/user/tracking')}>
              Close
            </button>
            <button type="submit" className={styles.saveBtn} disabled={loading || saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
