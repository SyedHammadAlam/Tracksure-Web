import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role) {
    const normalizedUserRole = user.role === 'customer' || user.role === 'user' ? 'user' : user.role
    const normalizedRequiredRole = role
    
    if (normalizedUserRole !== normalizedRequiredRole) {
      // Redirect to correct panel
      if (user.role === 'admin') return <Navigate to="/admin/users" replace />
      return <Navigate to="/user/tracking" replace />
    }
  }

  return children
}
