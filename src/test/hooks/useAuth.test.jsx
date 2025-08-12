import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) })) }))
    }))
  }
}))

describe('useAuth', () => {
  let supabase

  beforeEach(async () => {
    vi.clearAllMocks()
    ;({ supabase } = await import('../../lib/supabase'))
  })

  it('should initialize with loading state', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      )
    })

    // No início, loading é true; aguarde estabilizar e verifique estados iniciais sem sessão
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBe(null)
    expect(result.current.profile).toBe(null)
  })

  it('should check permissions correctly', async () => {
    // Simula sessão e perfil admin carregado pelo provider
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })

    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: { id: 'user-1', role: 'admin' }, error: null })
        })
      })
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      )
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAdmin()).toBe(true)
    expect(result.current.hasPermission('user')).toBe(true)
    expect(result.current.hasPermission('admin')).toBe(true)
    expect(result.current.hasPermission('super_admin')).toBe(false)
  })
})