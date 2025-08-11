import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { user, profile, loading, hasPermission } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />
  }

  if (!hasPermission(requiredRole)) {
    return <Navigate to="/" replace />
  }

  return children
}
