import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { CoursesPage } from '../../pages/CoursesPage'

vi.mock('../../lib/supabase', () => ({
  courses: {
    getPublished: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}))

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({ categories: [] })
}))

vi.mock('../../hooks/usePayment', () => ({
  usePayment: () => ({ createEnrollment: vi.fn() })
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
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

describe('CoursesPage', () => {
  it('renders courses page with hero section', async () => {
    renderWithProviders(<CoursesPage />)
    
    expect(screen.getByText('Cursos Online de Culinária')).toBeInTheDocument()
    expect(screen.getByText(/Aprenda técnicas profissionais/)).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    renderWithProviders(<CoursesPage />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays mock courses when API fails', async () => {
    renderWithProviders(<CoursesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Churrasco Perfeito')).toBeInTheDocument()
      expect(screen.getByText('Massas Artesanais')).toBeInTheDocument()
      expect(screen.getByText('Frutos do Mar Gourmet')).toBeInTheDocument()
    })
  })
})
