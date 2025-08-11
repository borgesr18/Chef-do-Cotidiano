import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  ChefHat, 
  FolderOpen, 
  BookOpen, 
  Users, 
  FileText, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: ChefHat, label: 'Receitas', path: '/admin/recipes' },
  { icon: FolderOpen, label: 'Categorias', path: '/admin/categories' },
  { icon: BookOpen, label: 'Cursos', path: '/admin/courses' },
  { icon: Users, label: 'Usuários', path: '/admin/users' },
  { icon: FileText, label: 'Blog', path: '/admin/blog' },
  { icon: Settings, label: 'Configurações', path: '/admin/settings' }
]

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            {sidebarOpen && (
              <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
            )}
          </div>
        </div>
        
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                location.pathname === item.path ? 'bg-primary/10 text-primary border-r-2 border-primary' : ''
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">Logado como:</p>
              <p className="text-sm font-medium text-gray-800">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size={sidebarOpen ? "sm" : "icon"}
            onClick={handleSignOut}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
