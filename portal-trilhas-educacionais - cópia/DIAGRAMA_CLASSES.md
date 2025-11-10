# Diagrama de Classes - Portal de Trilhas Educacionais

## Visão Geral da Arquitetura

Este documento apresenta o diagrama de classes do sistema de gerenciamento de trilhas educacionais.

## Diagrama de Classes Principal

```mermaid
classDiagram
    class User {
        +string id
        +string name
        +string email
        +string password
        +string role
        +boolean emailVerified
        +string phone
        +string cpf
        +string address
        +string createdAt
    }

    class Trilha {
        +string id
        +string title
        +string description
        +string category
        +string level
        +number duration
        +string thumbnail
        +string mentorId
        +number enrolledCount
        +number rating
        +string createdAt
    }

    class Turma {
        +string id
        +string trilhaId
        +string name
        +string mentorId
        +string modalidade
        +string location
        +string horario
        +Date startDate
        +Date endDate
        +string status
        +number maxStudents
        +number enrolledCount
        +number approvedCount
        +string createdAt
        +string createdBy
    }

    class TurmaInscription {
        +string id
        +string userId
        +string turmaId
        +string inscriptionDate
        +string status
        +number progress
        +string approvedAt
        +string approvedBy
        +string rejectedAt
        +string rejectedBy
        +string rejectionReason
    }

    class Certificate {
        +string id
        +string userId
        +string inscriptionId
        +string trilhaId
        +string trilhaTitle
        +string userName
        +string issuedAt
        +string certificateNumber
    }

    User "1" -- "0..*" TurmaInscription : realiza
    User "1" -- "0..*" Certificate : recebe
    User "1" -- "0..*" Trilha : mentora
    User "1" -- "0..*" Turma : coordena
    
    Trilha "1" -- "0..*" Turma : possui
    Turma "1" -- "0..*" TurmaInscription : contém
    TurmaInscription "1" -- "0..1" Certificate : gera
```

## Diagrama de Contextos React

```mermaid
classDiagram
    class AuthContext {
        +User user
        +boolean isAuthenticated
        +boolean isVerified
        +login(email, password)
        +logout()
        +register(userData)
        +verifyEmail(code)
        +updateProfile(data)
    }

    class DataContext {
        +Trilha[] trilhas
        +User[] users
        +loadTrilhas()
        +loadUsers()
        +refreshData()
    }

    class EnrollmentFlowContext {
        +Stage stage
        +startEnrollment(options)
        -resetFlow()
    }

    AuthContext "1" -- "1" User : gerencia
    EnrollmentFlowContext "1" ..> AuthContext : usa
```

## Diagrama de Serviços (Services)

```mermaid
classDiagram
    class TurmaService {
        <<service>>
        +getTurmasByTrilha(trilhaId)
        +getTurmasDisponiveis(trilhaId)
        +enrollInTurma(userId, turmaId)
        +syncTurmaEnrolledCount(turmaId)
        +approveTurmaInscription(id, coordId)
        +rejectTurmaInscription(id, coordId, reason)
        +cancelTurmaInscription(id, turmaId)
    }

    class ApiService {
        <<service>>
        +get(url)
        +post(url, data)
        +patch(url, data)
        +delete(url)
    }

    class TrilhaService {
        <<service>>
        +getAllTrilhas()
        +getTrilhaById(id)
        +createTrilha(data)
        +updateTrilha(id, data)
        +deleteTrilha(id)
    }

    class UserService {
        <<service>>
        +getAllUsers()
        +getUserById(id)
        +updateUser(id, data)
        +deleteUser(id)
    }

    TurmaService ..> ApiService : usa
    TrilhaService ..> ApiService : usa
    UserService ..> ApiService : usa
```

## Diagrama de Componentes Principais

```mermaid
classDiagram
    class CourseCard {
        <<component>>
        +Trilha trilha
        +UserStatus userStatus
        +onOpenTurmaModal()
        +onEnrollSuccess()
    }

    class TurmaCard {
        <<component>>
        +Turma turma
        +boolean isEnrolled
        +boolean loading
        +onEnroll(turmaId)
    }

    class EnrollButton {
        <<component>>
        +string trilhaId
        +string trilhaTitle
        +boolean disabled
        +boolean isEnrolled
        +onEnrollSuccess()
        -handleClick()
    }

    class TurmaSelectionModal {
        <<component>>
        +boolean isOpen
        +Trilha trilha
        +onClose()
        +onEnrollSuccess()
        -onEnroll(turmaId)
    }

    class LoginModal {
        <<component>>
        +boolean isOpen
        +string mode
        +onClose()
        +onRegisterSuccess()
        -handleLogin()
        -handleRegister()
    }

    CourseCard "1" -- "1" EnrollButton : contém
    TurmaSelectionModal "1" -- "0..*" TurmaCard : exibe
    TurmaCard "1" -- "1" EnrollButton : contém
```

## Diagrama de Páginas (Views)

```mermaid
classDiagram
    class CatalogPage {
        <<page>>
        +Trilha[] trilhas
        +TurmaInscription[] userInscriptions
        +string searchTerm
        +string selectedCategory
        +string selectedLevel
        -handleOpenTurmaModal(trilha)
        -getTrilhaStatus(trilhaId)
    }

    class Dashboard {
        <<page>>
        +User userData
        +Stats stats
        +TrilhaProgresso[] trilhasEmProgresso
        -loadDashboardData()
    }

    class AdminDashboard {
        <<page>>
        +Stats stats
        +User[] users
        +Trilha[] trilhas
        +TurmaInscription[] inscriptions
        +Certificate[] certificates
        -loadStats()
    }

    class AdminTrilhas {
        <<page>>
        +TrilhaWithStats[] trilhas
        +User[] mentores
        +number totalInscricoesGeral
        +string searchTerm
        +string filterLevel
        -loadTrilhas()
        -handleEdit(trilha)
        -handleDelete(id)
    }

    class InscriptionLogs {
        <<page>>
        +InscriptionLog[] logs
        +string searchTerm
        +string filterStatus
        +string filterDate
        -loadLogs()
        -applyFilters()
    }

    CatalogPage ..> TurmaSelectionModal : abre
    Dashboard ..> User : exibe dados
    AdminDashboard ..> Stats : calcula
    AdminTrilhas ..> TrilhaWithStats : gerencia
    InscriptionLogs ..> InscriptionLog : exibe
```

## Fluxo de Estados de Inscrição

```mermaid
stateDiagram-v2
    [*] --> Pending: Usuário se inscreve
    Pending --> Approved: Coordenador aprova
    Pending --> Rejected: Coordenador rejeita
    Approved --> Active: Turma inicia
    Active --> Completed: Progresso 100%
    Completed --> [*]: Certificado emitido
    Rejected --> [*]
    
    note right of Pending
        Status inicial
        Aguarda aprovação
    end note
    
    note right of Approved
        Aprovado mas turma
        ainda não iniciou
    end note
    
    note right of Active
        Aluno cursando
        0% < progress < 100%
    end note
```

## Hierarquia de Roles

```mermaid
classDiagram
    class UserRole {
        <<enumeration>>
        STUDENT
        MENTOR
        COORDINATOR
        ADMIN
    }

    class Permissions {
        <<interface>>
        +canViewCatalog()
        +canEnroll()
        +canManageTrilhas()
        +canManageTurmas()
        +canApproveInscriptions()
        +canManageUsers()
        +canViewReports()
    }

    UserRole --> Permissions : define

    note for UserRole "STUDENT: Visualiza e se inscreve\nMENTOR: Acompanha turmas\nCOORDINATOR: Gerencia turmas e aprova inscrições\nADMIN: Acesso total"
```

## Relacionamentos de Dados

```mermaid
erDiagram
    USER ||--o{ TURMA_INSCRIPTION : "se inscreve"
    USER ||--o{ CERTIFICATE : "recebe"
    USER ||--o{ TRILHA : "mentora"
    USER ||--o{ TURMA : "coordena/cria"
    
    TRILHA ||--o{ TURMA : "possui"
    TURMA ||--o{ TURMA_INSCRIPTION : "contém"
    TURMA_INSCRIPTION ||--o| CERTIFICATE : "gera"
    
    USER {
        string id PK
        string name
        string email UK
        string role
        boolean emailVerified
    }
    
    TRILHA {
        string id PK
        string title
        string mentorId FK
        string category
        string level
        number duration
    }
    
    TURMA {
        string id PK
        string trilhaId FK
        string mentorId FK
        string status
        number maxStudents
        number enrolledCount
    }
    
    TURMA_INSCRIPTION {
        string id PK
        string userId FK
        string turmaId FK
        string status
        number progress
        string approvedBy FK
    }
    
    CERTIFICATE {
        string id PK
        string userId FK
        string inscriptionId FK
        string trilhaId FK
        string certificateNumber UK
    }
```

## Padrões de Projeto Utilizados

### 1. **Context API Pattern**
- `AuthContext`: Gerenciamento global de autenticação
- `DataContext`: Cache e compartilhamento de dados
- `EnrollmentFlowContext`: Orquestração do fluxo de inscrição

### 2. **Service Layer Pattern**
- Separação da lógica de negócio (services) da UI (components)
- `turma.service.ts`, `api.ts`, etc.

### 3. **Custom Hooks Pattern**
- `useAuth()`: Acesso ao contexto de autenticação
- `useData()`: Acesso aos dados globais
- `useEnrollmentFlow()`: Controle do fluxo de inscrição
- `useTurmas()`: Operações relacionadas a turmas

### 4. **Modal Controller Pattern**
- Modais globais controlados por contexto
- Fluxo sequencial: Login → Verification → Enrollment

### 5. **Sync Pattern**
- `syncTurmaEnrolledCount()`: Sincronização automática de contadores

## Observações Técnicas

### Contagem de Inscrições
O sistema utiliza duas métricas:
- **enrolledCount** (por turma): Quantidade de vagas ocupadas (pending + approved + active + completed)
- **totalInscricoes** (por trilha): Usuários únicos inscritos em turmas da trilha

### Estados de Inscrição
1. **pending**: Aguardando aprovação do coordenador
2. **approved**: Aprovada, aguardando início da turma
3. **active**: Cursando (turma em andamento)
4. **completed**: Concluída (progress = 100%)
5. **rejected**: Rejeitada pelo coordenador

### Sincronização de Dados
- `enrolledCount` é sincronizado automaticamente após cada operação
- Inscrições rejeitadas não contam nas vagas
- Sistema auto-corrige inconsistências

---

**Última atualização**: 6 de novembro de 2025
