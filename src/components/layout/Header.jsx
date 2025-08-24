import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { 
  ChefHat, 
  Menu, 
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { LoginModal } from '../auth/LoginModal'
import { UserProfile } from '../auth/UserProfile'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { isAuthenticated, isAdmin } = useAuth()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground">Chef do Cotidiano</span>
                <span className="text-xs text-muted-foreground">AI</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">Início</Link>
              <Link to="/recipes" className="text-foreground hover:text-primary transition-colors">Receitas</Link>
              <Link to="/courses" className="text-foreground hover:text-primary transition-colors">Cursos</Link>
              <Link to="/ebooks" className="text-foreground hover:text-primary transition-colors">E-books</Link>
              <Link to="/blog" className="text-foreground hover:text-primary transition-colors">Blog</Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors">Sobre</Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && (
                <Link to="/my-ebooks" className="text-foreground hover:text-primary transition-colors">Meus E-books</Link>
              )}
              <Link to={isAdmin() ? "/admin" : "/admin/login"}>
                <Button size="sm" variant="secondary">Admin</Button>
              </Link>
              {isAuthenticated ? (
                <UserProfile />
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(true)}>
                    Entrar
                  </Button>
                  <Button size="sm" onClick={() => setShowLoginModal(true)}>
                    Cadastrar
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden border-t py-4">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="text-foreground hover:text-primary transition-colors">Início</Link>
                <Link to="/recipes" className="text-foreground hover:text-primary transition-colors">Receitas</Link>
                <Link to="/courses" className="text-foreground hover:text-primary transition-colors">Cursos</Link>
                <Link to="/ebooks" className="text-foreground hover:text-primary transition-colors">E-books</Link>
                <Link to="/blog" className="text-foreground hover:text-primary transition-colors">Blog</Link>
                <Link to="/about" className="text-foreground hover:text-primary transition-colors">Sobre</Link>
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  {isAuthenticated && (
                    <Link to="/my-ebooks" className="text-foreground hover:text-primary transition-colors">Meus E-books</Link>
                  )}
                  <Link to={isAdmin() ? "/admin" : "/admin/login"}>
                    <Button size="sm" variant="secondary" className="w-full">Painel Admin</Button>
                  </Link>
                  {isAuthenticated ? (
                    <UserProfile />
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(true)}>
                        Entrar
                      </Button>
                      <Button size="sm" onClick={() => setShowLoginModal(true)}>
                        Cadastrar
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  )
}

export default Header
