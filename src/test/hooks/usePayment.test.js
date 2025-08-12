import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('../../lib/supabase', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn()
        }))
      }))
    }))
  }
  return { supabase: mockSupabase }
})

import { usePayment } from '../../hooks/usePayment'

describe('usePayment', () => {
  let supabase

  beforeEach(async () => {
    vi.clearAllMocks()
    ;({ supabase } = await import('../../lib/supabase'))
  })

  it('creates enrollment successfully', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } }
    })

    const mockInsert = vi.fn().mockResolvedValue({
      data: { id: 'enrollment-123' },
      error: null
    })

    supabase.from.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: mockInsert
        })
      })
    })

    const { result } = renderHook(() => usePayment())

    const enrollmentResult = await result.current.createEnrollment('course-123', {
      method: 'stripe',
      amount: 99.90,
      transactionId: 'tx-123'
    })

    expect(enrollmentResult.data).toBeDefined()
    expect(enrollmentResult.error).toBeNull()
  })

  it('handles enrollment error', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const { result } = renderHook(() => usePayment())

    const enrollmentResult = await result.current.createEnrollment('course-123', {
      method: 'stripe',
      amount: 99.90,
      transactionId: 'tx-123'
    })

    expect(enrollmentResult.data).toBeNull()
    expect(enrollmentResult.error).toBeDefined()
  })
})
