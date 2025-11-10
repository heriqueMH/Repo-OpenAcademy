# 🎓 Portal de Trilhas Educacionais | Open Academy Mackenzie

Sistema completo de gerenciamento de trilhas educacionais desenvolvido em React + TypeScript para a Open Academy do Mackenzie. Oferece uma experiência moderna e intuitiva para alunos, mentores, coordenadores e administradores.

![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![JSON Server](https://img.shields.io/badge/JSON_Server-Mock_API-green)

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação](#-documentação)
- [Roles e Permissões](#-roles-e-permissões)
- [Fluxos Principais](#-fluxos-principais)

## ✨ Funcionalidades

### Para Alunos
- 📚 **Catálogo de Trilhas**: Exploração de trilhas com filtros (categoria, nível, busca)
- 🎯 **Sistema de Turmas**: Seleção de turmas específicas por trilha (presencial, híbrida, EAD)
- ✍️ **Inscrição Inteligente**: Fluxo completo (cadastro → verificação email → inscrição)
- 📊 **Dashboard Personalizado**: Acompanhamento de progresso e trilhas em andamento
- 🏆 **Certificados Digitais**: Geração automática ao completar trilhas
- 📱 **Perfil Completo**: Edição de dados pessoais e informações complementares

### Para Coordenadores
- ✅ **Aprovação de Inscrições**: Análise e aprovação/rejeição de solicitações
- 👥 **Gestão de Turmas**: Criação e gerenciamento de turmas por trilha
- 📋 **Logs Completos**: Histórico de todas as inscrições e modificações
- 📈 **Estatísticas**: Visão geral de inscrições ativas, pendentes e concluídas

### Para Administradores
- 🎨 **Gestão de Trilhas**: CRUD completo de trilhas educacionais
- 👤 **Gestão de Usuários**: Gerenciamento de alunos, mentores e coordenadores
- 📊 **Dashboard Administrativo**: Visão consolidada do sistema
- 🔍 **Auditoria**: Rastreamento completo de ações no sistema
- 📈 **Relatórios**: Estatísticas de inscrições, certificados e trilhas

## 🚀 Tecnologias

### Frontend
- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática e segurança de código
- **React Router v6** - Roteamento e navegação
- **React Icons** - Biblioteca de ícones
- **CSS Modules** - Estilização com escopo local

### Backend (Mock)
- **JSON Server** - API REST simulada
- **Axios** - Cliente HTTP

### Padrões e Arquitetura
- **Context API** - Gerenciamento de estado global
- **Custom Hooks** - Lógica reutilizável
- **Service Layer** - Separação de lógica de negócio
- **Component Composition** - Componentes reutilizáveis

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│           Componentes (UI)              │
├─────────────────────────────────────────┤
│     Contexts (Estado Global)            │
│  • AuthContext                          │
│  • DataContext                          │
│  • EnrollmentFlowContext                │
├─────────────────────────────────────────┤
│        Custom Hooks                     │
│  • useAuth                              │
│  • useData                              │
│  • useEnrollmentFlow                    │
├─────────────────────────────────────────┤
│       Services (Lógica)                 │
│  • TurmaService                         │
│  • UserService                          │
│  • ApiService                           │
├─────────────────────────────────────────┤
│     JSON Server (Mock API)              │
│  • users                                │
│  • trilhas                              │
│  • turmas                               │
│  • turma-inscriptions                   │
│  • certificates                         │
└─────────────────────────────────────────┘
```

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd portal-trilhas-educacionais
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   ```

4. **Inicie o JSON Server (em outro terminal)**
   ```bash
   npx json-server --watch db.json --port 25000
   ```

5. **Acesse a aplicação**
   - Frontend: `http://localhost:3000`
   - API Mock: `http://localhost:25000`

## 🎮 Uso

### Credenciais de Teste

**Administrador:**
```
Email: admin@mackenzie.br
Senha: admin123
```

**Coordenador:**
```
Email: coord@mackenzie.br  
Senha: coord123
```

**Aluno:**
```
Email: matheus@example.com
Senha: senha123
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── admin/          # Componentes administrativos
│   ├── catalog/        # Catálogo de trilhas
│   ├── common/         # Componentes compartilhados
│   ├── dashboard/      # Dashboard do aluno
│   ├── modals/         # Modais do sistema
│   └── user/           # Componentes de usuário
│
├── contexts/           # Context API
│   ├── AuthContext.tsx
│   ├── DataContext.tsx
│   └── EnrollmentFlowContext.tsx
│
├── hooks/              # Custom Hooks
│   ├── useAuth.ts
│   ├── useData.ts
│   └── useEnrollmentFlow.ts
│
├── pages/              # Páginas principais
│   ├── Home.tsx
│   ├── Dashboard.tsx
│   ├── CatalogPage.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminTrilhas.tsx
│   ├── AdminUsuarios.tsx
│   └── InscriptionLogs.tsx
│
├── services/           # Lógica de negócio
│   ├── api.ts
│   ├── turma.service.ts
│   └── index.ts
│
├── types/              # TypeScript types
│   └── index.ts
│
└── styles/             # Estilos globais
    └── global.css
```

## 📚 Documentação

- [📐 Diagrama de Classes](./DIAGRAMA_CLASSES.md) - Arquitetura e relacionamentos
- [📂 Estrutura de Pastas](./ESTRUTURA_PASTAS.md) - Organização detalhada
- [🔄 Refatoração](./REFATORACAO_ESTRUTURA.md) - Histórico de mudanças
- [🗄️ Otimização DB](./DB_OPTIMIZATION.md) - Estrutura de dados

## 👥 Roles e Permissões

| Funcionalidade | Aluno | Mentor | Coordenador | Admin |
|----------------|-------|---------|-------------|-------|
| Ver Catálogo | ✅ | ✅ | ✅ | ✅ |
| Inscrever-se | ✅ | ❌ | ✅ | ✅ |
| Gerenciar Turmas | ❌ | ❌ | ✅ | ✅ |
| Aprovar Inscrições | ❌ | ❌ | ✅ | ✅ |
| Gerenciar Trilhas | ❌ | ❌ | ❌ | ✅ |
| Gerenciar Usuários | ❌ | ❌ | ❌ | ✅ |
| Ver Logs | ❌ | ❌ | ✅ | ✅ |

## 🔄 Fluxos Principais

### Fluxo de Inscrição (Aluno)
```
1. Explorar Catálogo
   ↓
2. Selecionar Trilha
   ↓
3. Ver Turmas Disponíveis
   ↓
4. Clicar em "Inscrever-se"
   ↓
5. [Se não logado] Modal de Cadastro
   ↓
6. Verificação de Email
   ↓
7. Confirmação de Inscrição
   ↓
8. Status: PENDING (Aguardando Aprovação)
```

### Fluxo de Aprovação (Coordenador)
```
1. Acessar "Ver Inscrições"
   ↓
2. Visualizar Inscrições Pendentes
   ↓
3. Analisar Perfil do Aluno
   ↓
4. Aprovar ou Rejeitar
   ↓
5. [Se aprovado] Status: APPROVED
   ↓
6. [Quando turma inicia] Status: ACTIVE
```

### Estados de Inscrição
- **PENDING**: Aguardando aprovação do coordenador
- **APPROVED**: Aprovada, aguardando início da turma
- **ACTIVE**: Aluno cursando (0% < progresso < 100%)
- **COMPLETED**: Trilha concluída (progresso = 100%)
- **REJECTED**: Inscrição rejeitada

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia aplicação React

# Build
npm run build         # Cria build de produção

# Testes
npm test              # Executa testes

# JSON Server
npx json-server --watch db.json --port 25000
```

## 🎨 Padrões de Código

### Componentes
```typescript
// Componente funcional com TypeScript
interface Props {
  trilha: Trilha;
  onEnroll: () => void;
}

const CourseCard: React.FC<Props> = ({ trilha, onEnroll }) => {
  return <div>...</div>;
};

export default CourseCard;
```

### Services
```typescript
// Serviço com tratamento de erro
export const enrollInTurma = async (
  userId: string, 
  turmaId: string
): Promise<TurmaInscription> => {
  const response = await api.post('/turma-inscriptions', {
    userId,
    turmaId,
    status: 'pending'
  });
  
  await syncTurmaEnrolledCount(turmaId);
  return response.data;
};
```

## 🐛 Troubleshooting

### Porta 25000 em uso
```bash
# Encontrar processo
lsof -ti:25000

# Matar processo
kill -9 <PID>
```

### Cache do React
```bash
# Limpar cache
rm -rf node_modules/.cache
npm start
```

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autores

Desenvolvido para a **Open Academy | Mackenzie**

---

**Última atualização**: 6 de novembro de 2025