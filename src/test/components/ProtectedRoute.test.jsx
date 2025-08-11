import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'

const mockUseAuth = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

const TestComponent = () => <div>Protected Content</div>

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ProtectedRoute', () => {
  it('shows loading spinner when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
      hasPermission: vi.fn()
    })

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      hasPermission: vi.fn()
    })

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows content when user has permission', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' },
      profile: { role: 'admin' },
      loading: false,
      hasPermission: vi.fn().mockReturnValue(true)
    })

    renderWithRouter(
      <ProtectedRoute requiredRole="admin">
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects when user lacks permission', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' },
      profile: { role: 'user' },
      loading: false,
      hasPermission: vi.fn().mockReturnValue(false)
    })

    renderWithRouter(
      <ProtectedRoute requiredRole="admin">
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
