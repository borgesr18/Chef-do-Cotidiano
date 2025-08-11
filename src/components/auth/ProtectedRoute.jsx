import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { user, profile, loading, hasPermission } = useAuth()

  console.log('ProtectedRoute debug:', { user: !!user, profile: !!profile, loading, requiredRole, hasPermission: profile ? hasPermission(requiredRole) : false })

  if (loading) {
    console.log('ProtectedRoute: Still loading auth state...')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to home')
    return <Navigate to="/" replace />
  }

  if (!profile) {
    console.log('ProtectedRoute: No profile, redirecting to home')
    return <Navigate to="/" replace />
  }

  if (!hasPermission(requiredRole)) {
    console.log('ProtectedRoute: Permission denied for role:', requiredRole)
    return <Navigate to="/" replace />
  }

  console.log('ProtectedRoute: Access granted, rendering children')
  return children
}
