import styles from './Auth.module.css'

export default function MarkAsStolen() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mark as Stolen</h1>
      <form className={styles.form}>
        <label className={styles.label}>
          Name
          <input type="text" className={styles.input} placeholder="Full name" />
        </label>
        <label className={styles.label}>
          CNIC
          <input type="text" className={styles.input} placeholder="CNIC number" />
        </label>
        <label className={styles.label}>
          Password
          <input type="password" className={styles.input} placeholder="Password" />
        </label>
        <button type="submit" className={styles.submit}>Submit</button>
      </form>
    </div>
  )
}
