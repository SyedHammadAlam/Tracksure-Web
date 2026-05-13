import styles from './Pagination.module.css'

export default function Pagination({ pageData, onPageChange }) {
  if (!pageData) return null

  // Support Spring Data Page JSON and normalized page objects
  const totalPages = (pageData.totalPages ?? pageData.total) || 1
  const currentPage = pageData.number ?? pageData.currentPage ?? 0

  const hasNext =
    pageData.last != null
      ? !pageData.last
      : (pageData.hasNext ?? false)

  const hasPrevious =
    pageData.first != null
      ? !pageData.first
      : (pageData.hasPrevious ?? false)

  const pages = []

  for (
    let i = Math.max(0, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pages.push(i)
  }

  if (currentPage > 2) {
    pages.unshift('...')
  }

  if (currentPage < totalPages - 3) {
    pages.push('...')
  }

  if (!pages.includes(0)) {
    pages.unshift(0)
  }

  if (!pages.includes(totalPages - 1) && totalPages > 1) {
    pages.push(totalPages - 1)
  }

  return (
    <div className={styles.pagination}>
      <button
        className={styles.button}
        disabled={!hasPrevious}
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
      >
        ← Previous
      </button>

      <div className={styles.pages}>
        {pages.map((page, i) =>
          page === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className={styles.ellipsis}
            >
              …
            </span>
          ) : (
            <button
              key={page}
              className={
                page === currentPage
                  ? styles.buttonActive
                  : styles.button
              }
              onClick={() => onPageChange(page)}
            >
              {page + 1}
            </button>
          )
        )}
      </div>

      <button
        className={styles.button}
        disabled={!hasNext}
        onClick={() =>
          onPageChange(Math.min(totalPages - 1, currentPage + 1))
        }
      >
        Next →
      </button>

      <span className={styles.info}>
        Page {currentPage + 1} of {totalPages}
      </span>
    </div>
  )
}