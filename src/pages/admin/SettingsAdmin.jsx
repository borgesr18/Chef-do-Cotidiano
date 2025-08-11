import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Palette, 
  Mail, 
  Search, 
  Globe, 
  CreditCard,
  Shield,
  Database
} from 'lucide-react'

export const SettingsAdmin = () => {
  const [settings, setSettings] = useState({
    siteName: 'Chef do Cotidiano',
    siteDescription: 'Receitas deliciosas para o seu dia a dia',
    siteUrl: 'https://chefdocotidiano.com',
    logoUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    enableRegistration: true,
    enableComments: true,
    enableNewsletter: true,
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    stripePublicKey: '',
    stripeSecretKey: '',
    mercadoPagoPublicKey: '',
    mercadoPagoAccessToken: ''
  })

  const handleSave = async (section) => {
    try {
      console.log(`Saving ${section} settings:`, settings)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600 mt-2">Gerencie as configurações globais do site</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>SEO</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Pagamentos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações Gerais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="siteName">Nome do Site</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">URL do Site</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => updateSetting('siteUrl', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Descrição do Site</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="logoUrl">URL do Logo</Label>
                <Input
                  id="logoUrl"
                  value={settings.logoUrl}
                  onChange={(e) => updateSetting('logoUrl', e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Funcionalidades</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableRegistration">Permitir Registro de Usuários</Label>
                    <p className="text-sm text-gray-500">Permite que novos usuários se registrem no site</p>
                  </div>
                  <Switch
                    id="enableRegistration"
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => updateSetting('enableRegistration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableComments">Permitir Comentários</Label>
                    <p className="text-sm text-gray-500">Permite comentários em receitas e posts</p>
                  </div>
                  <Switch
                    id="enableComments"
                    checked={settings.enableComments}
                    onCheckedChange={(checked) => updateSetting('enableComments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableNewsletter">Newsletter</Label>
                    <p className="text-sm text-gray-500">Permite inscrição na newsletter</p>
                  </div>
                  <Switch
                    id="enableNewsletter"
                    checked={settings.enableNewsletter}
                    onCheckedChange={(checked) => updateSetting('enableNewsletter', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('general')}>
                Salvar Configurações Gerais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Aparência</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                      placeholder="#10B981"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave('appearance')}>
                Salvar Configurações de Aparência
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Configurações de Email</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtpHost">Servidor SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">Porta SMTP</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting('smtpPort', e.target.value)}
                    placeholder="587"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtpUser">Usuário SMTP</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => updateSetting('smtpUser', e.target.value)}
                    placeholder="seu-email@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">Senha SMTP</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                    placeholder="sua-senha-de-app"
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('email')}>
                Salvar Configurações de Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>SEO e Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                <Input
                  id="facebookPixelId"
                  value={settings.facebookPixelId}
                  onChange={(e) => updateSetting('facebookPixelId', e.target.value)}
                  placeholder="123456789012345"
                />
              </div>

              <Button onClick={() => handleSave('seo')}>
                Salvar Configurações de SEO
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Integrações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                Configure integrações com serviços externos como redes sociais, 
                ferramentas de marketing e outros sistemas.
              </p>
              
              <div className="text-center py-8">
                <p className="text-gray-500">Integrações serão implementadas em versões futuras</p>
              </div>

              <Button onClick={() => handleSave('integrations')}>
                Salvar Integrações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Configurações de Pagamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Stripe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="stripePublicKey">Chave Pública Stripe</Label>
                    <Input
                      id="stripePublicKey"
                      value={settings.stripePublicKey}
                      onChange={(e) => updateSetting('stripePublicKey', e.target.value)}
                      placeholder="pk_test_..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="stripeSecretKey">Chave Secreta Stripe</Label>
                    <Input
                      id="stripeSecretKey"
                      type="password"
                      value={settings.stripeSecretKey}
                      onChange={(e) => updateSetting('stripeSecretKey', e.target.value)}
                      placeholder="sk_test_..."
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Mercado Pago</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="mercadoPagoPublicKey">Chave Pública Mercado Pago</Label>
                    <Input
                      id="mercadoPagoPublicKey"
                      value={settings.mercadoPagoPublicKey}
                      onChange={(e) => updateSetting('mercadoPagoPublicKey', e.target.value)}
                      placeholder="APP_USR-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="mercadoPagoAccessToken">Access Token Mercado Pago</Label>
                    <Input
                      id="mercadoPagoAccessToken"
                      type="password"
                      value={settings.mercadoPagoAccessToken}
                      onChange={(e) => updateSetting('mercadoPagoAccessToken', e.target.value)}
                      placeholder="APP_USR-..."
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave('payments')}>
                Salvar Configurações de Pagamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
