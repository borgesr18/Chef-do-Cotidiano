import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Mail, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export const AdminLogin = () => {
  const navigate = useNavigate()
  const { signIn, hasPermission, isAuthenticated, loading: authLoading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Se já está autenticado e tem permissão, redireciona para o painel
    if (isAuthenticated && hasPermission('admin')) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate, hasPermission])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const { error: signInError } = await signIn(form.email, form.password)
      if (signInError) {
        setError(signInError.message)
        return
      }

      // Se não redirecionou, checa permissão e mostra mensagem apropriada
      const isAdmin = hasPermission('admin')
      if (!isAdmin) {
        setError('Sua conta não possui permissão de administrador.')
        return
      }

      navigate('/admin', { replace: true })
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Acesso Administrativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Sua senha de administrador"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting || authLoading}>
              {(submitting || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar como Admin
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            Somente contas com papel <span className="font-semibold">admin</span> ou <span className="font-semibold">super_admin</span> terão acesso.
          </p>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-primary hover:underline">Voltar para o site</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLogin

