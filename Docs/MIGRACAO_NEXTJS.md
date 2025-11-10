# 🚀 Portal Trilhas Educacionais - Migração Next.js

## 📋 Guia de Migração Completo

### Estrutura do Projeto

```
portal-trilhas-educacionais/
├── client/                 # Frontend Next.js 14
│   ├── src/
│   │   ├── app/           # App Router (rotas)
│   │   ├── components/    # Componentes React
│   │   ├── lib/          # Utilitários e helpers
│   │   └── types/        # TypeScript types
│   ├── public/           # Assets estáticos
│   └── package.json
│
├── server/                # Backend Node.js + Express
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── database.ts   # Database manager
│   │   └── server.ts     # Express server
│   ├── db.json           # Dados
│   └── package.json
│
└── package.json          # Root workspace
```

## 🔧 Instalação

### 1. Instalar dependências do servidor
```bash
cd server
npm install
```

### 2. Instalar dependências do cliente
```bash
cd client
npm install axios react-icons
```

### 3. Configurar variáveis de ambiente

**server/.env:**
```env
PORT=25000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**client/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:25000/api
```

## 🚀 Executar o Projeto

### Opção 1: Separadamente

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Opção 2: Concurrently (Recomendado)

**Na raiz do projeto:**
```bash
npm install -D concurrently
```

Adicione no `package.json` raiz:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "npm run build:server && npm run build:client",
    "build:server": "cd server && npm run build",
    "build:client": "cd client && npm run build"
  }
}
```

Depois execute:
```bash
npm run dev
```

## 📦 Principais Mudanças

### React Router → Next.js App Router

**Antes (CRA):**
```tsx
// src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/catalog" element={<CatalogPage />} />
  </Routes>
</BrowserRouter>
```

**Depois (Next.js):**
```
client/src/app/
├── page.tsx              # / (Home)
├── catalog/
│   └── page.tsx         # /catalog
├── dashboard/
│   └── page.tsx         # /dashboard
└── layout.tsx           # Layout global
```

### CSS Modules → Mantidos (compatível)

Os arquivos `.module.css` continuam funcionando normalmente no Next.js!

### API Calls → Server Actions (opcional)

**Antes:**
```tsx
const data = await axios.get('http://localhost:25000/users');
```

**Depois (Client Component):**
```tsx
const data = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/users');
```

**Ou (Server Component - recomendado):**
```tsx
async function getUsers() {
  const res = await fetch('http://localhost:25000/api/users', {
    cache: 'no-store'
  });
  return res.json();
}
```

### Context API → Mantido

Os contextos (AuthContext, DataContext) funcionam normalmente com:
```tsx
'use client'; // Adicionar no topo dos arquivos de contexto
```

## 🎯 Checklist de Migração

### Backend ✅
- [x] Criar estrutura server/
- [x] Configurar Express + TypeScript
- [x] Implementar rotas RESTful
- [x] Configurar CORS
- [x] Copiar db.json

### Frontend
- [ ] Migrar componentes para client/src/components/
- [ ] Migrar páginas para client/src/app/
- [ ] Migrar contextos (adicionar 'use client')
- [ ] Migrar serviços API
- [ ] Migrar estilos CSS
- [ ] Configurar variáveis de ambiente
- [ ] Testar todas as rotas
- [ ] Ajustar imports

## 📝 Próximos Passos

1. **Copiar componentes:**
```bash
cp -r src/components client/src/
cp -r src/types client/src/
cp -r src/contexts client/src/
cp -r src/hooks client/src/
```

2. **Adicionar 'use client' nos componentes que precisam:**
   - Componentes com useState
   - Componentes com useEffect
   - Componentes com event handlers
   - Contextos

3. **Criar páginas no App Router:**
   - `app/page.tsx` - Home
   - `app/catalog/page.tsx` - Catálogo
   - `app/dashboard/page.tsx` - Dashboard
   - `app/admin/page.tsx` - Admin
   - etc.

4. **Atualizar chamadas API:**
```tsx
// Criar lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

## 🚀 Benefícios da Migração

✅ **Server-Side Rendering (SSR)** - Melhor SEO e performance  
✅ **Streaming & Suspense** - Carregamento progressivo  
✅ **Image Optimization** - Imagens otimizadas automaticamente  
✅ **Route Handlers** - API routes integradas (opcional)  
✅ **TypeScript** - Suporte nativo melhorado  
✅ **Hot Reload** - Mais rápido que CRA  
✅ **Build otimizado** - Bundle menor e mais rápido  

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
