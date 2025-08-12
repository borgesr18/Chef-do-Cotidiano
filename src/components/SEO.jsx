import { Helmet } from 'react-helmet-async'

export const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  article = null 
}) => {
  const siteTitle = 'Chef do Cotidiano'
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const defaultDescription = 'Receitas deliciosas e práticas para o seu dia a dia. Aprenda a cozinhar com o Chef do Cotidiano.'
  const defaultImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=630&fit=crop'
  const siteUrl = 'https://chefdocotidiano.com'

  const seoTitle = fullTitle
  const seoDescription = description || defaultDescription
  const seoImage = image || defaultImage
  const seoUrl = url || siteUrl

  console.log('SEO render', { type, articleExists: !!article, published: article?.publishedTime })

  return (
    <Helmet defer={false}>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={siteTitle} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      
      {type === 'article' && (
        <>
          {article?.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article?.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article?.author && (
            <meta property="article:author" content={article.author} />
          )}
          {Array.isArray(article?.tags) && article.tags.map(tag => (
            <meta key={`article-tag-${tag}`} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      <link rel="canonical" href={seoUrl} />
    </Helmet>
  )
}
