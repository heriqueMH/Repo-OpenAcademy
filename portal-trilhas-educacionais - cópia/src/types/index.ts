// ========================
// TIPOS DE USUÁRIO
// ========================

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isVerified: boolean; // Controle de verificação por código de email
    role: 'visitante' | 'aluno' | 'mentor' | 'coordenador' | 'admin';
    createdAt: string;
    
    // Dados adicionais do cadastro
    cpf?: string;
    gender?: 'masculino' | 'feminino' | 'nao-binario' | 'prefiro-nao-dizer';
    education?: 'fundamental-incompleto' | 'fundamental-cursando' | 'fundamental-completo' | 'medio-incompleto' | 'medio-cursando' | 'medio-completo' | 'superior-incompleto' | 'superior-cursando' | 'superior-completo' | 'pos-graduacao';
    hasBolsaFamilia?: boolean;
    birthDate?: string; // ISO date
    address?: {
        cep: string;
        state: string;
        city: string;
        street?: string;
        number?: string;
        complement?: string;
    };
    
    // Vínculo com Mackenzie
    isMackenzieStudent?: boolean;
    mackenzieData?: {
        course: string; // Nome do curso
        semester: number; // Semestre atual (1-10)
        registrationNumber?: string; // RA
        campus?: string; // Higienópolis, Alphaville, Campinas, etc.
    };
}

// ========================
// VERIFICAÇÃO DE EMAIL
// ========================

export interface EmailVerification {
    userId: string;
    email: string;
    code: string; // Código de 6 dígitos
    expiresAt: string; // ISO timestamp
    verified: boolean;
    createdAt: string;
}

// ========================
// DASHBOARD & ESTATÍSTICAS
// ========================

export interface DashboardStats {
    trilhasInscritas: number;
    trilhasConcluidas: number;
    horasEstudadas: number;
    certificados: number;
    sequenciaDias: number;
    pontos: number;
    nivel: string; // "Iniciante", "Intermediário", "Avançado"
    proximoNivel: number; // Pontos necessários para próximo nível
}

export interface TrilhaEmProgresso {
    id: string;
    inscricaoId: string;
    trilhaId: string;
    titulo: string;
    thumbnail?: string;
    progresso: number; // 0-100
    ultimaAula: string;
    proximaAula: string;
    tempoRestante: string; // "8h 30min"
    dataUltimoAcesso: string; // ISO date
    totalModulos: number;
    modulosConcluidos: number;
}

export interface AtividadeRecente {
    id: string;
    tipo: 'conclusao' | 'certificado' | 'inscricao' | 'conquista' | 'badge';
    titulo: string;
    descricao: string;
    trilhaId?: string;
    trilhaTitulo?: string;
    icone?: string;
    timestamp: string; // ISO date
    metadata?: {
        progresso?: number;
        nota?: number;
        badge?: string;
        certificadoUrl?: string;
    };
}

export interface ConquistasBadges {
    id: string;
    nome: string;
    descricao: string;
    icone: string;
    categoria: 'engajamento' | 'conhecimento' | 'conclusao' | 'especial';
    conquistado: boolean;
    dataConquista?: string; // ISO date
    progresso?: number; // 0-100 para badges em progresso
    criterio: string; // "Completar 5 trilhas", "Estudar 7 dias seguidos"
}

export interface DashboardData {
    stats: DashboardStats;
    trilhasEmProgresso: TrilhaEmProgresso[];
    atividadesRecentes: AtividadeRecente[];
    conquistasBadges: ConquistasBadges[];
    recomendacoes: Trilha[]; // Trilhas recomendadas baseadas no perfil
}


// ========================
// TIPOS DE TRILHA
// ========================

export interface Trilha {
    id: string;
    title: string;
    description: string;
    mentorId: string; // Referência ao ID do mentor em users
    duration: number; // Duração em horas
    level: 'iniciante' | 'intermediário' | 'avançado';
    category: string;
    thumbnail?: string;
    enrolledCount: number;
    rating?: number;
    
    // Dados populados após fetch (opcional)
    mentor?: {
        id: string;
        name: string;
        avatar?: string;
    };
}

// ========================
// PROGRESSO DO ALUNO
// ========================

export interface UserProgress {
    trilhaId: string;
    progress: number; // 0-100
    completedAt?: string;
    certificateUrl?: string;
    lastAccessedAt: string;
}

// ========================
// CONTEXTOS
// ========================

export interface AuthContextType {
    user: User | null;
    isVerified: boolean;
    isAuthenticated: boolean;
    token: string | null;
    
    // Autenticação com Email/Senha
    loginWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
    
    // Verificação de Email
    verifyEmail: (code: string) => Promise<void>;
    resendVerificationCode: () => Promise<void>;
    
    // Atualizar status de verificação
    updateVerification: (verified: boolean) => void;
    
    // Atualizar perfil do usuário
    updateUserProfile: (userData: Partial<User>) => void;
    
    logout: () => void;
}

export interface DataContextType {
    trilhas: Trilha[];
    userProgress: UserProgress[];
    loading: boolean;
    getTrilhaById: (id: string) => Trilha | undefined;
    enrollInTrilha: (trilhaId: string) => Promise<void>;
    getUserProgress: (trilhaId: string) => UserProgress | undefined;
}

// ========================
// FORMULÁRIOS
// ========================

export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface EnrollmentFormData {
    // Dados pessoais
    fullName: string;
    cpf: string;
    gender: 'masculino' | 'feminino' | 'nao-binario' | 'prefiro-nao-dizer';
    education: 'fundamental-incompleto' | 'fundamental-cursando' | 'fundamental-completo' | 'medio-incompleto' | 'medio-cursando' | 'medio-completo' | 'superior-incompleto' | 'superior-cursando' | 'superior-completo' | 'pos-graduacao';
    hasBolsaFamilia: boolean;
    birthDate: string;
    
    // Endereço
    cep: string;
    state: string;
    city: string;
    street?: string;
    number?: string;
    complement?: string;
    
    // Vínculo Mackenzie
    isMackenzieStudent: boolean;
    mackenzieData?: {
        course: string;
        semester: number;
        registrationNumber?: string;
        campus?: string;
    };
    
    // Trilha
    trilhaId: string;
}

// ========================
// EXPORTAÇÕES DOS NOVOS TIPOS MODULARES
// ========================

export * from './turma.types';