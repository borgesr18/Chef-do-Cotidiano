import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { 
  ChefHat,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Chef do Cotidiano AI</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Receitas masculinas e práticas para impressionar na cozinha.
            </p>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Receitas</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/recipes/category/carnes" className="hover:text-primary transition-colors">Carnes</Link></li>
              <li><Link to="/recipes/category/massas" className="hover:text-primary transition-colors">Massas</Link></li>
              <li><Link to="/recipes/category/churrasco" className="hover:text-primary transition-colors">Churrasco</Link></li>
              <li><Link to="/recipes/category/frutos-do-mar" className="hover:text-primary transition-colors">Frutos do Mar</Link></li>
              <li><Link to="/recipes/category/bebidas" className="hover:text-primary transition-colors">Bebidas</Link></li>
              <li><Link to="/recipes/category/sobremesas" className="hover:text-primary transition-colors">Sobremesas</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Cursos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-primary transition-colors">Básico de Culinária</Link></li>
              <li><Link to="/courses" className="hover:text-primary transition-colors">Churrasco Profissional</Link></li>
              <li><Link to="/courses" className="hover:text-primary transition-colors">Massas Artesanais</Link></li>
              <li><Link to="/courses" className="hover:text-primary transition-colors">Técnicas Avançadas</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contato@chefdocotidiano.com</li>
              <li>(11) 99999-9999</li>
              <li>São Paulo, SP</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Chef do Cotidiano AI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
