import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SEO } from '../components/SEO'

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Página não encontrada - Chef do Cotidiano"
        description="A página que você procura não existe. Volte para a página inicial ou explore nossas receitas."
        image="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=630&fit=crop"
      />
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Página não encontrada</h1>
        <p className="text-muted-foreground mb-8">A página que você procura não existe ou foi movida.</p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/">Ir para Início</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/recipes">Explorar Receitas</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound