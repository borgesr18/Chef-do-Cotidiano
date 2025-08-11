import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import RecipesPage from './pages/RecipesPage'
import CategoryPage from './pages/CategoryPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import { AuthCallback } from './pages/AuthCallback'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { RecipesAdmin } from './pages/admin/RecipesAdmin'
import { CategoriesAdmin } from './pages/admin/CategoriesAdmin'
import { CoursesAdmin } from './pages/admin/CoursesAdmin'
import { UsersAdmin } from './pages/admin/UsersAdmin'
import { BlogAdmin } from './pages/admin/BlogAdmin'
import { SettingsAdmin } from './pages/admin/SettingsAdmin'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="recipes" element={<RecipesAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="courses" element={<CoursesAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="blog" element={<BlogAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
        
        <Route path="/*" element={
          <>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/recipes" element={<RecipesPage />} />
                <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
                <Route path="/recipes/:category" element={<CategoryPage />} />
                <Route path="/courses" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold mb-4">Cursos Online</h1><p className="text-muted-foreground">Em breve...</p></div>} />
                <Route path="/blog" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold mb-4">Blog</h1><p className="text-muted-foreground">Em breve...</p></div>} />
                <Route path="/about" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold mb-4">Sobre</h1><p className="text-muted-foreground">Em breve...</p></div>} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  )
}

export default App
