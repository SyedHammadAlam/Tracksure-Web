import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/Pagination'
import { getAdminStolenReportsGrouped } from '../../api/stolenApi'
import styles from './AdminPanels.module.css'

export default function AdminStolenReports() {
  const { user } = useAuth()
  const [reportGroups, setReportGroups] = useState([])
  const [pageData, setPageData] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pageSize = 10

  useEffect(() => {
    loadReports(currentPage)
  }, [currentPage])

  const loadReports = async (page) => {
    setLoading(true)
    setError('')
    const r = await getAdminStolenReportsGrouped(user?.accessToken, { page, size: pageSize })
    if (r.ok) {
      setReportGroups(r.data)
      setPageData(r.page)
    } else {
      setError(r.error || 'Failed to load stolen reports')
      setReportGroups([])
    }
    setLoading(false)
  }

  return (
    <div className={styles.panelCard}>
      <h1 className={styles.title}>All Stolen Reports</h1>
      <p className={styles.subtitle}>View all stolen device reports grouped by user.</p>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : reportGroups.length === 0 ? (
        <p className={styles.empty}>No stolen reports found.</p>
      ) : (
        <>
          <div className={styles.groupedReports}>
            {reportGroups.map((group) => (
              <div key={group.userId} className={styles.reportGroup}>
                <div className={styles.groupHeader}>
                  <h3>{group.username}</h3>
                  <span className={styles.email}>{group.email}</span>
                  <span className={styles.badge}>{group.stolenReports.length} report{group.stolenReports.length !== 1 ? 's' : ''}</span>
                </div>

                {group.stolenReports.length === 0 ? (
                  <p className={styles.noReports}>No stolen reports from this user.</p>
                ) : (
                  <ul className={styles.reportList}>
                    {group.stolenReports.map((report) => (
                      <li key={report.stolenDeviceId} className={styles.reportItem}>
                        <div className={styles.reportDetails}>
                          <strong>{report.deviceName}</strong>
                          <span className={styles.date}>{new Date(report.timestamp).toLocaleString()}</span>
                          {report.latitude && report.longitude && (
                            <span className={styles.location}>
                              📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                            </span>
                          )}
                          {report.additionalNotes && (
                            <p className={styles.notes}>{report.additionalNotes}</p>
                          )}
                        </div>
                        <span className={report.isRecovered ? styles.badgeRecovered : styles.badgeActive}>
                          {report.isRecovered ? 'Recovered' : 'Active'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <Pagination pageData={pageData} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  )
}
