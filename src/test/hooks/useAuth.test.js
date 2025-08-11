import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../../contexts/AuthContext'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    }
  },
  profiles: {
    getById: vi.fn()
  }
}))

const AuthWrapper = ({ children }) => {
  return children
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthWrapper
    })
    
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.profile).toBe(null)
  })

  it('should check permissions correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthWrapper
    })
    
    result.current.profile = { role: 'admin' }
    
    expect(result.current.hasPermission('user')).toBe(true)
    expect(result.current.hasPermission('admin')).toBe(true)
    expect(result.current.hasPermission('super_admin')).toBe(false)
  })
})
