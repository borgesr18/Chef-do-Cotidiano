import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { BlogPage } from '../../pages/BlogPage'

vi.mock('../../lib/supabase', () => ({
  blogPosts: {
    getPublished: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}))

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({ categories: [] })
}))

const renderWithProviders = (component) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </HelmetProvider>
  )
}

describe('BlogPage', () => {
  it('renders blog page with hero section', async () => {
    renderWithProviders(<BlogPage />)
    
    expect(screen.getByText('Blog Chef do Cotidiano')).toBeInTheDocument()
    expect(screen.getByText(/Dicas, receitas, histórias/)).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    renderWithProviders(<BlogPage />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays mock blog posts when API fails', async () => {
    renderWithProviders(<BlogPage />)
    
    await waitFor(() => {
      expect(screen.getByText('10 Dicas para um Churrasco Perfeito')).toBeInTheDocument()
      expect(screen.getByText('A História da Culinária Brasileira')).toBeInTheDocument()
      expect(screen.getByText('Como Escolher os Melhores Ingredientes')).toBeInTheDocument()
    })
  })
})
