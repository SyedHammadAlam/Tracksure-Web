export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/** Must match tracksure-be `app.admin.secret` (env ADMIN_SECRET), default admin123 */
export const ADMIN_API_SECRET = import.meta.env.VITE_ADMIN_API_SECRET || 'admin123'
