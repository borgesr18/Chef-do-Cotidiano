import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { ChefHat } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import './App.css'

function App() {
  const { isAuthenticated, loading: authLoading, user } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 mb-8">
          <ChefHat className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">Chef do Cotidiano</span>
            <span className="text-xs text-muted-foreground">AI</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-6">
          Receitas <span className="text-primary">Masculinas</span> e Práticas
        </h1>

        <p className="text-xl text-muted-foreground mb-8">
          Sistema funcionando! Status de autenticação: {isAuthenticated ? 'Logado' : 'Não logado'}
        </p>

        {user && (
          <div className="bg-card p-4 rounded-lg border mb-8">
            <h2 className="text-lg font-semibold mb-2">Usuário Logado:</h2>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
          </div>
        )}

        <div className="space-y-4">
          <Button size="lg">
            Teste de Botão
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">🥩 Carnes</h3>
              <p className="text-sm text-muted-foreground">45 receitas</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">🍝 Massas</h3>
              <p className="text-sm text-muted-foreground">32 receitas</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">🔥 Churrasco</h3>
              <p className="text-sm text-muted-foreground">28 receitas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

