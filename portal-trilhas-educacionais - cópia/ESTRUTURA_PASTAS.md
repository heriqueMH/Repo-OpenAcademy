# 📁 Estrutura de Pastas - Portal Trilhas Educacionais

## 📂 Organização do Projeto

```
src/
├── assets/                    # Recursos estáticos
│   ├── images/               # Imagens do projeto
│   └── icons/                # Ícones e SVGs
│
├── components/               # Componentes React reutilizáveis
│   ├── catalog/             # Componentes do catálogo de trilhas
│   │   ├── CourseCard.tsx
│   │   ├── EnrollButton.tsx
│   │   └── index.ts         # Barrel export
│   │
│   ├── common/              # Componentes compartilhados
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── index.ts
│   │
│   ├── modals/              # Modais do sistema
│   │   ├── LoginModal.tsx
│   │   ├── RegisterModal.tsx
│   │   ├── EnrollmentModal.tsx
│   │   ├── VerificationModal.tsx
│   │   ├── ComplementaryDataModal.tsx
│   │   └── index.ts
│   │
│   └── user/                # Componentes de usuário
│       ├── Login.tsx
│       ├── UserProfile.tsx
│       └── index.ts
│
├── contexts/                # Contextos React (Context API)
│   ├── AuthContext.tsx      # Autenticação
│   ├── DataContext.tsx      # Dados das trilhas
│   ├── EnrollmentFlowContext.tsx  # Fluxo de inscrição
│   └── index.ts
│
├── hooks/                   # Custom Hooks
│   ├── useAuth.ts          # Hook de autenticação
│   ├── useData.ts          # Hook de dados
│   ├── useEnrollmentFlow.ts # Hook de inscrição
│   └── index.ts
│
├── pages/                   # Páginas da aplicação
│   ├── Home.tsx
│   ├── Dashboard.tsx
│   ├── CatalogPage.tsx
│   ├── MyInscriptionsPage.tsx
│   ├── ProfilePage.tsx
│   ├── VerifyEmailPage.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminTrilhas.tsx
│   ├── AdminUsuarios.tsx
│   └── index.ts
│
├── services/                # Serviços e API
│   ├── api.ts              # Chamadas HTTP (Axios)
│   └── index.ts
│
├── styles/                  # Estilos globais
│   └── global.css
│
├── types/                   # TypeScript types/interfaces
│   └── index.ts
│
├── utils/                   # Funções utilitárias
│   ├── helpers.ts
│   └── index.ts
│
├── App.tsx                  # Componente principal
└── index.tsx                # Entry point
```

## 🎯 Convenções

### Nomenclatura
- **Componentes**: PascalCase (`CourseCard.tsx`)
- **Arquivos CSS**: ComponentName.module.css
- **Hooks**: camelCase começando com `use` (`useAuth.ts`)
- **Utilitários**: camelCase (`helpers.ts`)
- **Pastas**: camelCase ou kebab-case

### Barrel Exports (index.ts)
Cada pasta principal tem um `index.ts` para facilitar imports:

```typescript
// ❌ Antes
import CourseCard from '../../components/catalog/CourseCard';
import EnrollButton from '../../components/catalog/EnrollButton';

// ✅ Depois
import { CourseCard, EnrollButton } from '@/components/catalog';
```

### CSS Modules
Todos os componentes usam CSS Modules para evitar conflitos de estilo:

```typescript
import styles from './Component.module.css';

<div className={styles.container}>...</div>
```

## 📦 Estrutura de Dados

### Database (db.json)
```json
{
  "trilhas": [...],           // Trilhas com mentorId
  "users": [...],             // Usuários (alunos, mentores, admins)
  "emailVerifications": [...],// Códigos de verificação
  "inscriptions": [...]       // Inscrições (userId + trilhaId)
}
```

## 🔄 Fluxo de Dados

1. **API Layer** (`services/api.ts`)
   - Comunicação com JSON Server
   - Funções helper para buscar dados relacionados

2. **Contexts** (`contexts/`)
   - Estado global da aplicação
   - Gerenciamento de autenticação e dados

3. **Hooks** (`hooks/`)
   - Acesso simplificado aos contexts
   - Lógica reutilizável

4. **Components** (`components/`)
   - Consomem hooks e contexts
   - Apresentação de UI

## 🚀 Melhorias Implementadas

✅ Pasta `usuario/` renomeada para `user/` (padronização em inglês)
✅ Arquivo obsoleto `EnrollmentModal.old.tsx` removido
✅ Pasta `assets/` criada para recursos estáticos
✅ Barrel exports (`index.ts`) em todas as pastas principais
✅ Custom hooks criados na pasta `hooks/`
✅ Estrutura organizada e escalável

## 📝 Próximos Passos

- Mover imagens públicas para `src/assets/images/`
- Criar componentes de UI reutilizáveis (Button, Input, etc.)
- Adicionar testes unitários (`__tests__/` em cada pasta)
- Implementar lazy loading para páginas
- Adicionar Storybook para documentação de componentes
