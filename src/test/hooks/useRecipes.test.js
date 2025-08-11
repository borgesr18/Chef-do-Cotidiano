import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRecipes } from '../../hooks/useRecipes'

vi.mock('../../lib/supabase', () => ({
  recipes: {
    getPublished: vi.fn(),
    getByCategory: vi.fn()
  }
}))

describe('useRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useRecipes())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe(null)
  })

  it('should fetch recipes on mount', async () => {
    const mockRecipes = [
      { id: 1, title: 'Test Recipe', status: 'published' }
    ]

    const { recipes } = await import('../../lib/supabase')
    recipes.getPublished.mockResolvedValue({ data: mockRecipes, error: null })

    const { result } = renderHook(() => useRecipes())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockRecipes)
    expect(recipes.getPublished).toHaveBeenCalledWith(10, 0)
  })

  it('should handle API errors gracefully', async () => {
    const { recipes } = await import('../../lib/supabase')
    recipes.getPublished.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useRecipes())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data.length).toBeGreaterThan(0)
    expect(result.current.error).toBeTruthy()
  })
})
