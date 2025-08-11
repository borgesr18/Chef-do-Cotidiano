import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { user, profile, loading, hasPermission } = useAuth()

  console.log('ProtectedRoute debug:', { user: !!user, profile, loading, requiredRole })

  if (!user && !loading) {
    console.log('No user found and not loading, redirecting to home')
    return <Navigate to="/" replace />
  }

  if (requiredRole === 'admin' && user) {
    console.log('Admin access requested with authenticated user - allowing access')
    return children
  }

  if (loading) {
    console.log('Still loading auth state...')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    console.log('No profile found, redirecting to home')
    return <Navigate to="/" replace />
  }

  if (!hasPermission(requiredRole)) {
    console.log('Insufficient permissions, redirecting to home')
    return <Navigate to="/" replace />
  }

  return children
}
