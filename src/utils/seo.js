export const generateRecipeStructuredData = (recipe) => {
  return {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": recipe.title,
    "description": recipe.description,
    "image": recipe.featured_image,
    "author": {
      "@type": "Person",
      "name": recipe.author_name || "Chef do Cotidiano"
    },
    "prepTime": `PT${recipe.prep_time || 0}M`,
    "cookTime": `PT${recipe.cook_time || 0}M`,
    "totalTime": `PT${(recipe.prep_time || 0) + (recipe.cook_time || 0)}M`,
    "recipeYield": recipe.servings?.toString() || "1",
    "recipeCategory": recipe.category_name,
    "recipeCuisine": "Brazilian",
    "recipeIngredient": recipe.ingredients?.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`) || [],
    "recipeInstructions": recipe.instructions?.map((instruction, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "text": instruction
    })) || [],
    "aggregateRating": recipe.avg_rating ? {
      "@type": "AggregateRating",
      "ratingValue": recipe.avg_rating,
      "ratingCount": "1"
    } : undefined
  }
}

export const generateBreadcrumbStructuredData = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}
