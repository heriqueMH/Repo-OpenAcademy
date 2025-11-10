// ========================
// TIPOS DE TURMA
// ========================

export type ModalidadeTurma = 'presencial' | 'hibrida' | 'ead-sincrono' | 'ead-assincrono';

export interface Turma {
    id: string;
    trilhaId: string; // Referência à trilha
    name: string; // Ex: "Turma Novembro/2025"
    mentorId?: string; // Mentor responsável pela turma (opcional para EAD assíncrono)
    startDate: string; // ISO date (apenas data, sem hora) - Data de início
    endDate: string; // ISO date (apenas data, sem hora) - Data de término
    modalidade: ModalidadeTurma; // Tipo de modalidade da turma
    location?: string; // Local (obrigatório apenas para presencial/híbrida)
    horario?: string; // Horário das aulas (ex: "19h às 22h", "Terças e Quintas 14h-18h")
    status: 'planejada' | 'inscricoes-abertas' | 'em-andamento' | 'concluida';
    maxStudents: number; // Quantidade máxima de vagas
    enrolledCount: number; // Quantidade de alunos inscritos
    approvedCount: number; // Quantidade de alunos aprovados
    createdAt: string;
    createdBy: string; // ID do coordenador que criou
    
    // Dados populados após fetch (opcional)
    trilha?: {
        id: string;
        title: string;
        thumbnail?: string;
        category?: string;
        level?: string;
    };
    mentor?: {
        id: string;
        name: string;
        avatar?: string;
    };
}

// ========================
// INSCRIÇÃO EM TURMA
// ========================

export interface TurmaInscription {
    id: string;
    userId: string;
    turmaId: string;
    inscriptionDate: string; // ISO date
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
    progress: number; // 0-100
    attendance?: number; // Frequência 0-100 (percentual de presença)
    approvedAt?: string; // Data de aprovação (ISO date)
    approvedBy?: string; // ID do coordenador que aprovou
    rejectedAt?: string; // Data de rejeição (ISO date)
    rejectedBy?: string; // ID do coordenador que rejeitou
    rejectionReason?: string; // Motivo da rejeição
    
    // Dados populados após fetch (opcional)
    turma?: Turma;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
        cpf?: string;
        education?: string;
    };
}
