import { describe, it, expect } from 'vitest'
import { render, waitFor } from '@testing-library/react'
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
  it('renders basic meta tags', async () => {
    renderWithHelmet(
      <SEO 
        title="Test Title"
        description="Test Description"
        image="/test-image.jpg"
      />
    )

    await waitFor(() => {
      expect(document.title).toBe('Test Title | Chef do Cotidiano')
    })
    
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription?.getAttribute('content')).toBe('Test Description')
    
    const ogTitle = document.querySelector('meta[property="og:title"]')
    expect(ogTitle?.getAttribute('content')).toBe('Test Title | Chef do Cotidiano')
  })

  it('renders article meta tags', async () => {
    renderWithHelmet(
      <SEO 
        title="Recipe Title"
        description="Recipe Description"
        type="article"
        article={{
          publishedTime: '2023-01-01',
          modifiedTime: '2023-01-02',
          author: 'Chef Test',
          tags: ['recipe', 'cooking']
        }}
      />
    )

    await waitFor(() => {
      const ogType = document.querySelector('meta[property="og:type"]')
      expect(ogType?.getAttribute('content')).toBe('article')
    })
  })

  it('uses default values when props are not provided', async () => {
    renderWithHelmet(<SEO />)

    await waitFor(() => {
      expect(document.title).toBe('Chef do Cotidiano')
    })
    
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription?.getAttribute('content')).toContain('Receitas deliciosas')
  })
})

it('define title e metatags corretamente', () => {
	const helmetContext = {}
	render(
		<HelmetProvider context={helmetContext}>
			<SEO 
				title="Página de Teste"
				description="Descrição de teste"
				image="https://example.com/og.jpg"
				url="https://example.com/teste"
			/>
		</HelmetProvider>
	)

	expect(document.title).toContain('Página de Teste')
	const metaDesc = document.querySelector('meta[name="description"]')
	expect(metaDesc).toBeTruthy()
	expect(metaDesc.getAttribute('content')).toBe('Descrição de teste')
	const ogTitle = document.querySelector('meta[property="og:title"]')
	expect(ogTitle).toBeTruthy()
	expect(ogTitle.getAttribute('content')).toContain('Página de Teste')
})
