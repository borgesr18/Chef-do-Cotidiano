import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { SEO } from '../../components/SEO'

const renderWithHelmet = (component) => {
  return render(
    <HelmetProvider>
      {component}
    </HelmetProvider>
  )
}

describe('SEO', () => {
  it('renders basic meta tags', () => {
    renderWithHelmet(
      <SEO 
        title="Test Title"
        description="Test Description"
        image="/test-image.jpg"
      />
    )

    expect(document.title).toBe('Test Title | Chef do Cotidiano')
    
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription?.getAttribute('content')).toBe('Test Description')
    
    const ogTitle = document.querySelector('meta[property="og:title"]')
    expect(ogTitle?.getAttribute('content')).toBe('Test Title | Chef do Cotidiano')
  })

  it('renders article meta tags', () => {
    renderWithHelmet(
      <SEO 
        title="Recipe Title"
        description="Recipe Description"
        type="article"
        article={{
          publishedTime: '2023-01-01',
          author: 'Chef Test',
          tags: ['recipe', 'cooking']
        }}
      />
    )

    const articlePublished = document.querySelector('meta[property="article:published_time"]')
    expect(articlePublished?.getAttribute('content')).toBe('2023-01-01')
    
    const articleAuthor = document.querySelector('meta[property="article:author"]')
    expect(articleAuthor?.getAttribute('content')).toBe('Chef Test')
  })

  it('uses default values when props are not provided', () => {
    renderWithHelmet(<SEO />)

    expect(document.title).toBe('Chef do Cotidiano')
    
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription?.getAttribute('content')).toContain('Receitas deliciosas')
  })
})
