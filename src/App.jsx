import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import './App.css'

const HomePage = lazy(() => import('./pages/HomePage'))
const RecipesPage = lazy(() => import('./pages/RecipesPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const RecipeDetailPage = lazy(() => import('./pages/RecipeDetailPage'))
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(module => ({ default: module.AuthCallback })))

const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(module => ({ default: module.AdminLayout })))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })))
const RecipesAdmin = lazy(() => import('./pages/admin/RecipesAdmin').then(module => ({ default: module.RecipesAdmin })))
const RecipeForm = lazy(() => import('./pages/admin/RecipeForm').then(module => ({ default: module.RecipeForm })))
const CategoriesAdmin = lazy(() => import('./pages/admin/CategoriesAdmin').then(module => ({ default: module.CategoriesAdmin })))
const CoursesAdmin = lazy(() => import('./pages/admin/CoursesAdmin').then(module => ({ default: module.CoursesAdmin })))
const CourseForm = lazy(() => import('./pages/admin/CourseForm').then(module => ({ default: module.CourseForm })))
const BlogAdmin = lazy(() => import('./pages/admin/BlogAdmin').then(module => ({ default: module.BlogAdmin })))
const BlogForm = lazy(() => import('./pages/admin/BlogForm').then(module => ({ default: module.BlogForm })))
const UsersAdmin = lazy(() => import('./pages/admin/UsersAdmin').then(module => ({ default: module.UsersAdmin })))
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin').then(module => ({ default: module.SettingsAdmin })))

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/recipes" element={<RecipesPage />} />
                  <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
                  <Route path="/recipes/:category" element={<CategoryPage />} />
                  <Route path="/courses" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold mb-4">Cursos Online</h1><p className="text-muted-foreground">Em breve...</p></div>} />
                  <Route path="/blog" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold mb-4">Blog</h1><p className="text-muted-foreground">Em breve...</p></div>} />
                  <Route path="/about" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold mb-4">Sobre</h1><p className="text-muted-foreground">Em breve...</p></div>} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminLayout>
                        <Routes>
                          <Route index element={<AdminDashboard />} />
                          <Route path="recipes" element={<RecipesAdmin />} />
                          <Route path="recipes/new" element={<RecipeForm />} />
                          <Route path="recipes/:id/edit" element={<RecipeForm />} />
                          <Route path="categories" element={<CategoriesAdmin />} />
                          <Route path="courses" element={<CoursesAdmin />} />
                          <Route path="courses/new" element={<CourseForm />} />
                          <Route path="courses/:id/edit" element={<CourseForm />} />
                          <Route path="blog" element={<BlogAdmin />} />
                          <Route path="blog/new" element={<BlogForm />} />
                          <Route path="blog/:id/edit" element={<BlogForm />} />
                          <Route path="users" element={<UsersAdmin />} />
                          <Route path="settings" element={<SettingsAdmin />} />
                        </Routes>
                      </AdminLayout>
                    </ProtectedRoute>
                  } />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  )
}

export default App
