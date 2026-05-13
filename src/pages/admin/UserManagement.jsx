import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/Pagination'
import { getAllUsers } from '../../api/adminApi'
const API_URL = 'http://192.168.18.246:8080' // Base URL derived from project context
import styles from './AdminPanels.module.css'

export default function UserManagement() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [pageData, setPageData] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchUsername, setSearchUsername] = useState('')

  const pageSize = 10

  useEffect(() => {
    loadUsers(currentPage)
  }, [currentPage])

  const loadUsers = async (page) => {
    setLoading(true)
    setError('')
    const r = await getAllUsers(user?.accessToken, { page, size: pageSize, username: searchUsername })
    if (r.ok) {
      setUsers(r.data)
      setPageData(r.page)
    } else {
      setError(r.error || 'Failed to load users')
      setUsers([])
    }
    setLoading(false)
  }

  const handleRoleChange = async (targetUserId, newRole) => {
    const token = user?.accessToken
    if (!token || !targetUserId) return

    if (!window.confirm(`Are you sure you want to change the role of user ID ${targetUserId} to ${newRole}?`)) {
      return
    }

    setLoading(true)
    setError('')
    try {
      // PUT /v1/admin/users/{userId}/role
      const response = await fetch(`${API_URL}/v1/admin/users/${targetUserId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        await loadUsers(currentPage)
      } else {
        const errData = await response.json().catch(() => ({}))
        setError(errData.message || 'Failed to update user role')
      }
    } catch (err) {
      setError('A network error occurred while updating the role')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(0)
    loadUsers(0)
  }

  return (
    <div className={styles.panelCard}>
      <h1 className={styles.title}>User Management</h1>
      <p className={styles.subtitle}>View and manage all registered users.</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actionBar} style={{ marginBottom: '2rem' }}>
        <form className={styles.searchForm} onSubmit={handleSearch} style={{
          display: 'flex',
          maxWidth: '300px',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)'
        }}>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className={styles.searchInput}
            style={{ flex: 1, padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: 'var(--text)', outline: 'none', fontSize: '0.9rem', lineHeight: '1.5' }}
          />
          <button 
            type="submit" 
            className={styles.searchButton} 
            disabled={loading}
            style={{ 
              padding: '0 1rem', 
              border: 'none', 
              borderLeft: '1px solid var(--border)',
              backgroundColor: 'var(--bg-toggled)', 
              color: 'var(--accent)', 
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? '...' : 'SEARCH'}
          </button>
        </form>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : users.length === 0 ? (
        <p className={styles.empty}>No users found.</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId}>
                    <td>{u.userId}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <div className={styles.roleCell}>
                        <select
                          className={`${styles.roleSelect} ${u.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeUser}`}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                          disabled={loading || String(u.userId) === String(user?.id)}
                          style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="CUSTOMER">CUSTOMER</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pageData={pageData} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  )
}
