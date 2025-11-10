# 🚀 Portal Trilhas Educacionais - Backend Node.js + Express

Backend API em Node.js com TypeScript para o Portal de Trilhas Educacionais da Open Academy Mackenzie.

## 📋 Características

- ✅ **Node.js + Express** - Framework web rápido e minimalista
- ✅ **TypeScript** - Tipagem estática para maior segurança
- ✅ **In-Memory Database** - Dados carregados do `db.json`
- ✅ **RESTful API** - Endpoints padronizados
- ✅ **CORS** - Configurado para frontend em desenvolvimento
- ✅ **Hot Reload** - Reinício automático com `tsx watch`
- ✅ **Segurança** - Helmet para headers HTTP seguros
- ✅ **Compressão** - Respostas comprimidas automaticamente

## 🛠️ Instalação

```bash
cd server
npm install
```

## 📦 Dependências

### Produção
- `express` - Framework web
- `cors` - Cross-Origin Resource Sharing
- `helmet` - Segurança HTTP headers
- `compression` - Compressão de respostas
- `morgan` - Logging de requisições
- `dotenv` - Variáveis de ambiente

### Desenvolvimento
- `typescript` - Superset JavaScript com tipos
- `tsx` - Execução TypeScript com hot reload
- `@types/*` - Definições de tipos

## 🚀 Como Usar

### Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm start
```

## 🌐 Endpoints Disponíveis

### Users
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar usuário
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Trilhas
- `GET /api/trilhas` - Listar trilhas
- `GET /api/trilhas/:id` - Buscar trilha por ID
- `POST /api/trilhas` - Criar trilha
- `PATCH /api/trilhas/:id` - Atualizar trilha
- `DELETE /api/trilhas/:id` - Deletar trilha

### Turmas
- `GET /api/turmas?trilhaId=X&_expand=trilha&_expand=mentor` - Listar turmas (com expansão)
- `GET /api/turmas/:id?_expand=trilha` - Buscar turma por ID
- `POST /api/turmas` - Criar turma
- `PATCH /api/turmas/:id` - Atualizar turma
- `DELETE /api/turmas/:id` - Deletar turma

### Inscrições em Turmas
- `GET /api/turma-inscriptions?userId=X&status=active` - Listar inscrições
- `GET /api/turma-inscriptions/:id` - Buscar inscrição por ID
- `POST /api/turma-inscriptions` - Criar inscrição
- `PATCH /api/turma-inscriptions/:id` - Atualizar inscrição
- `DELETE /api/turma-inscriptions/:id` - Deletar inscrição

### Certificados
- `GET /api/certificates?userId=X` - Listar certificados
- `GET /api/certificates/:id` - Buscar certificado por ID
- `POST /api/certificates` - Criar certificado
- `DELETE /api/certificates/:id` - Deletar certificado

### Health Check
- `GET /health` - Verificar status do servidor

## 📁 Estrutura do Projeto

```
server/
├── src/
│   ├── routes/
│   │   ├── index.ts              # Agregador de rotas
│   │   ├── users.routes.ts       # Rotas de usuários
│   │   ├── trilhas.routes.ts     # Rotas de trilhas
│   │   ├── turmas.routes.ts      # Rotas de turmas
│   │   ├── inscriptions.routes.ts # Rotas de inscrições
│   │   └── certificates.routes.ts # Rotas de certificados
│   ├── types/
│   │   └── index.ts              # Definições de tipos
│   ├── database.ts               # Classe de gerenciamento de dados
│   └── server.ts                 # Arquivo principal
├── db.json                       # Dados (copiado da raiz)
├── .env                          # Variáveis de ambiente
├── package.json
└── tsconfig.json
```

## 🔧 Configuração

Arquivo `.env`:
```env
PORT=25000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🔄 Migração do json-server

O backend substitui completamente o `json-server` com:

1. **Mesma API** - Endpoints compatíveis com o código frontend existente
2. **Expansão de dados** - Suporte a `_expand` para popular relacionamentos
3. **Query strings** - Filtros por parâmetros (`?userId=X`, `?status=active`)
4. **Performance** - Mais rápido que json-server
5. **Extensível** - Fácil adicionar validações, autenticação, etc.

## 📝 Notas

- Dados são carregados em memória do `db.json` na inicialização
- Mudanças não são persistidas (use um banco real para produção)
- Para persistência, integre com MongoDB, PostgreSQL, etc.
