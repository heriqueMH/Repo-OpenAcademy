// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;
  isVerified: boolean;
  role: 'student' | 'coordinator' | 'admin';
  createdAt: string;
  cpf?: string;
  gender?: string;
  education?: string;
  hasBolsaFamilia?: boolean;
  birthDate?: string;
  address?: Address;
  isMackenzieStudent?: boolean;
  mackenzieData?: MackenzieData;
}

export interface Address {
  cep: string;
  state: string;
  city: string;
  street: string;
  number: string;
  complement?: string;
}

export interface MackenzieData {
  course: string;
  semester: number;
  registrationNumber: string;
  campus: string;
}

// Trilha Types
export interface Trilha {
  id: string;
  title: string;
  description: string;
  mentorId?: string;
  duration: number;
  level: string;
  category: string;
  thumbnail?: string;
  enrolledCount: number;
  rating: number;
}

// Turma Types
export type ModalidadeTurma = 'Presencial' | 'EAD Síncrono' | 'EAD Assíncrono' | 'Híbrido';

export interface Turma {
  id: string;
  trilhaId: string;
  name: string;
  mentorId?: string;
  startDate: string;
  endDate: string;
  modalidade: ModalidadeTurma;
  location?: string;
  horario?: string;
  status: 'planejada' | 'inscricoes-abertas' | 'em-andamento' | 'concluida';
  maxStudents: number;
  enrolledCount: number;
  approvedCount: number;
  createdAt: string;
  createdBy: string;
}

// Turma Inscription Types
export type TurmaInscriptionStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';

export interface TurmaInscription {
  id: string;
  userId: string;
  turmaId: string;
  inscriptionDate: string;
  status: TurmaInscriptionStatus;
  progress: number;
  attendance?: number;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

// Certificate Types
export interface Certificate {
  id: string;
  userId: string;
  inscriptionId: string;
  trilhaId: string;
  trilhaTitle: string;
  userName: string;
  issuedAt: string;
  certificateNumber: string;
}

// Database Schema
export interface DatabaseSchema {
  users: User[];
  trilhas: Trilha[];
  turmas: Turma[];
  'turma-inscriptions': TurmaInscription[];
  inscriptions: any[]; // Deprecated
  certificates: Certificate[];
}
