import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import RecipesPage from './pages/RecipesPage'
import CategoryPage from './pages/CategoryPage'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:category" element={<CategoryPage />} />
          <Route path="/courses" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold mb-4">Cursos Online</h1><p className="text-muted-foreground">Em breve...</p></div>} />
          <Route path="/blog" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold mb-4">Blog</h1><p className="text-muted-foreground">Em breve...</p></div>} />
          <Route path="/about" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold mb-4">Sobre</h1><p className="text-muted-foreground">Em breve...</p></div>} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default App
