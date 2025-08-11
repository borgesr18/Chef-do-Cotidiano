import { describe, it, expect } from 'vitest'
import { generateRecipeStructuredData, generateBreadcrumbStructuredData } from '../../utils/seo'

describe('SEO Utils', () => {
  describe('generateRecipeStructuredData', () => {
    it('generates correct recipe structured data', () => {
      const recipe = {
        title: 'Test Recipe',
        description: 'A test recipe',
        featured_image: '/test-image.jpg',
        author_name: 'Chef Test',
        prep_time: 15,
        cook_time: 30,
        servings: 4,
        category_name: 'Main Course',
        ingredients: [
          { name: 'Flour', quantity: '2', unit: 'cups' },
          { name: 'Sugar', quantity: '1', unit: 'cup' }
        ],
        instructions: [
          'Mix ingredients',
          'Bake for 30 minutes'
        ],
        avg_rating: 4.5
      }

      const structuredData = generateRecipeStructuredData(recipe)

      expect(structuredData['@context']).toBe('https://schema.org/')
      expect(structuredData['@type']).toBe('Recipe')
      expect(structuredData.name).toBe('Test Recipe')
      expect(structuredData.prepTime).toBe('PT15M')
      expect(structuredData.cookTime).toBe('PT30M')
      expect(structuredData.totalTime).toBe('PT45M')
      expect(structuredData.recipeIngredient).toHaveLength(2)
      expect(structuredData.recipeInstructions).toHaveLength(2)
      expect(structuredData.aggregateRating.ratingValue).toBe(4.5)
    })
  })

  describe('generateBreadcrumbStructuredData', () => {
    it('generates correct breadcrumb structured data', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Recipes', url: '/recipes' },
        { name: 'Test Recipe', url: '/recipes/test-recipe' }
      ]

      const structuredData = generateBreadcrumbStructuredData(items)

      expect(structuredData['@context']).toBe('https://schema.org')
      expect(structuredData['@type']).toBe('BreadcrumbList')
      expect(structuredData.itemListElement).toHaveLength(3)
      expect(structuredData.itemListElement[0].position).toBe(1)
      expect(structuredData.itemListElement[0].name).toBe('Home')
    })
  })
})
