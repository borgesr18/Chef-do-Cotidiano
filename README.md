# Chef do Cotidiano 🍳

**Chef do Cotidiano** é uma plataforma educacional completa voltada ao ensino de culinária prática para homens. Oferece cursos online, emissão de certificados com validação pública, painel administrativo, e controle de usuários e notificações.

---

## 🚀 Funcionalidades Principais

### 👨‍🍳 Público (aluno)
- Acesso aos cursos
- Conclusão e emissão de certificados
- Página pública de verificação de certificado com QR Code
- Notificações por e-mail e WhatsApp (configuráveis)

### 🔐 Autenticação
- Login/cadastro com Supabase Auth
- Sistema multiusuário com tipos: `ALUNO`, `ADMIN`

### 🧑‍🏫 Admin
- Painel completo com:
  - Dashboard
  - Emissão de certificados
  - Relatórios com filtros e gráficos (PDF)
  - Tela de verificação manual
  - Histórico de auditoria e IPs bloqueados
- Exportação em PDF
- Gráficos com Recharts

### 📄 Certificados
- Gerados com jsPDF
- Salvos automaticamente no Supabase Storage
- Com código de verificação criptografado (SHA256)
- QR Code com link direto
- Auditoria e segurança anti-spam por IP

---

## 🧰 Tecnologias Utilizadas

- [Next.js 14](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Prisma ORM](https://www.prisma.io/)
- [jsPDF](https://github.com/parallax/jsPDF)
- [uuid](https://www.npmjs.com/package/uuid)
- [Recharts](https://recharts.org/)

---

## ⚙️ Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seuusuario/chefdocotidiano
cd chefdocotidiano

# Instale as dependências
npm install

# Crie o arquivo .env.local com suas credenciais Supabase
cp .env.example .env.local

