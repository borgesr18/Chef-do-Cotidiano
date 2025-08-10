import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  User, 
  Settings, 
  Heart, 
  BookOpen, 
  LogOut, 
  ChefHat,
  Shield
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export const UserProfile = () => {
  const { user, profile, signOut, isAdmin, isChef } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !profile) return null

  // Obter iniciais do nome
  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Obter cor do badge baseado no role
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'text-red-600'
      case 'admin':
        return 'text-orange-600'
      case 'chef':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  // Obter nome do role em português
  const getRoleName = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'admin':
        return 'Administrador'
      case 'chef':
        return 'Chef'
      default:
        return 'Usuário'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback>
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile.full_name || 'Usuário'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center space-x-1 mt-1">
              {profile.role === 'super_admin' && (
                <Shield className={`h-3 w-3 ${getRoleBadgeColor(profile.role)}`} />
              )}
              {profile.role === 'admin' && (
                <Shield className={`h-3 w-3 ${getRoleBadgeColor(profile.role)}`} />
              )}
              {profile.role === 'chef' && (
                <ChefHat className={`h-3 w-3 ${getRoleBadgeColor(profile.role)}`} />
              )}
              <span className={`text-xs ${getRoleBadgeColor(profile.role)}`}>
                {getRoleName(profile.role)}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Heart className="mr-2 h-4 w-4" />
          <span>Receitas Favoritas</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Meus Cursos</span>
        </DropdownMenuItem>
        
        {(isChef() || isAdmin()) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ChefHat className="mr-2 h-4 w-4" />
              <span>Minhas Receitas</span>
            </DropdownMenuItem>
          </>
        )}
        
        {isAdmin() && (
          <DropdownMenuItem>
            <Shield className="mr-2 h-4 w-4" />
            <span>Painel Admin</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={loading}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loading ? 'Saindo...' : 'Sair'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserProfile

