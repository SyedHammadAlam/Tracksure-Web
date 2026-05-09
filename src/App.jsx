import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/PublicLayout'
import AdminLayout from './pages/admin/AdminLayout'
import AllTracking from './pages/admin/AllTracking'
import StolenRequests from './pages/admin/StolenRequests'
import UserLayout from './pages/user/UserLayout'
import UserTracking from './pages/user/UserTracking'
import UserMarkAsStolen from './pages/user/UserMarkAsStolen'
import UserSettings from './pages/user/UserSettings'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Registration from './pages/Registration'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/user/tracking" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/signup" element={<PublicLayout><SignUp /></PublicLayout>} />
      <Route path="/registration" element={<PublicLayout><Registration /></PublicLayout>} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AllTracking />} />
        <Route path="stolen-requests" element={<StolenRequests />} />
      </Route>

      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/tracking" replace />} />
        <Route path="tracking" element={<UserTracking />} />
        <Route path="mark-stolen" element={<UserMarkAsStolen />} />
        <Route path="settings" element={<UserSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
