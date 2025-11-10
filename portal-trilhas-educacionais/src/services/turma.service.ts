import api from './api';
import { Turma, TurmaInscription } from '../types';

// ========================
// SERVIÇOS DE TURMAS
// ========================

/**
 * Sincroniza o enrolledCount de uma turma com as inscrições reais
 */
export const syncTurmaEnrolledCount = async (turmaId: string): Promise<void> => {
  // Busca todas as inscrições da turma (exceto rejected)
  const response = await api.get(`/turma-inscriptions?turmaId=${turmaId}`);
  const inscriptions = response.data;
  
  // Conta apenas inscrições válidas (pending, active, approved, completed)
  const validInscriptions = inscriptions.filter((insc: any) => 
    ['pending', 'active', 'approved', 'completed'].includes(insc.status)
  );
  
  // Atualiza o contador na turma
  await api.patch(`/turmas/${turmaId}`, {
    enrolledCount: validInscriptions.length
  });
};

/**
 * Busca todas as turmas de uma trilha específica
 */
export const getTurmasByTrilha = async (trilhaId: string): Promise<Turma[]> => {
  const response = await api.get(`/turmas?trilhaId=${trilhaId}`);
  return response.data;
};

/**
 * Busca turmas disponíveis (com inscrições abertas) de uma trilha
 */
export const getTurmasDisponiveis = async (trilhaId: string): Promise<Turma[]> => {
  const response = await api.get(`/turmas?trilhaId=${trilhaId}&status=inscricoes-abertas`);
  return response.data;
};

/**
 * Busca uma turma específica por ID
 */
export const getTurmaById = async (id: string): Promise<Turma> => {
  const response = await api.get(`/turmas/${id}`);
  return response.data;
};

/**
 * Busca uma turma com dados populados (trilha e mentor)
 */
export const getTurmaWithDetails = async (id: string): Promise<Turma> => {
  const response = await api.get(`/turmas/${id}?_expand=trilha&_expand=mentor`);
  return response.data;
};

/**
 * Busca todas as turmas de uma trilha com detalhes
 */
export const getTurmasByTrilhaWithDetails = async (trilhaId: string): Promise<Turma[]> => {
  const response = await api.get(`/turmas?trilhaId=${trilhaId}&_expand=trilha&_expand=mentor`);
  return response.data;
};

/**
 * Cria uma nova turma (Admin)
 */
export const createTurma = async (turmaData: Partial<Turma>): Promise<Turma> => {
  const response = await api.post('/turmas', {
    ...turmaData,
    enrolledCount: 0,
    createdAt: new Date().toISOString(),
  });
  return response.data;
};

/**
 * Atualiza uma turma existente (Admin)
 */
export const updateTurma = async (id: string, turmaData: Partial<Turma>): Promise<Turma> => {
  const response = await api.patch(`/turmas/${id}`, turmaData);
  return response.data;
};

/**
 * Deleta uma turma (Admin)
 */
export const deleteTurma = async (id: string): Promise<void> => {
  await api.delete(`/turmas/${id}`);
};

// ========================
// SERVIÇOS DE INSCRIÇÕES EM TURMAS
// ========================

/**
 * Inscreve um usuário em uma turma
 */
export const enrollInTurma = async (userId: string, turmaId: string): Promise<TurmaInscription> => {
  // Verifica se a turma tem vagas (baseado em inscrições reais)
  const turma = await getTurmaById(turmaId);
  const inscriptionsResponse = await api.get(`/turma-inscriptions?turmaId=${turmaId}`);
  const validInscriptions = inscriptionsResponse.data.filter((insc: any) => 
    ['pending', 'active', 'approved', 'completed'].includes(insc.status)
  );
  
  if (validInscriptions.length >= turma.maxStudents) {
    throw new Error('Turma lotada. Não há mais vagas disponíveis.');
  }
  
  // Cria a inscrição com status 'pending' (aguardando aprovação)
  const response = await api.post('/turma-inscriptions', {
    userId,
    turmaId,
    inscriptionDate: new Date().toISOString(),
    status: 'pending', // Aguardando aprovação
    progress: 0,
  });
  
  // Sincroniza o contador de inscritos
  await syncTurmaEnrolledCount(turmaId);
  
  return response.data;
};

/**
 * Busca todas as inscrições de um usuário em turmas
 */
export const getUserTurmaInscriptions = async (userId: string): Promise<TurmaInscription[]> => {
  const response = await api.get(`/turma-inscriptions?userId=${userId}`);
  return response.data;
};

/**
 * Busca inscrições de um usuário com dados completos (turma + trilha)
 */
export const getUserTurmaInscriptionsWithDetails = async (userId: string): Promise<TurmaInscription[]> => {
  const inscriptions = await getUserTurmaInscriptions(userId);
  
  const result = await Promise.all(inscriptions.map(async (inscription) => {
    try {
      // Usa getTurmaWithDetails para incluir trilha e mentor
      const turma = await getTurmaWithDetails(inscription.turmaId);
      return {
        ...inscription,
        turma,
      };
    } catch (error) {
      console.error(`Erro ao carregar turma ${inscription.turmaId}:`, error);
      return inscription;
    }
  }));
  
  return result;
};

/**
 * Verifica se um usuário já está inscrito em uma turma específica
 */
export const checkTurmaInscription = async (userId: string, turmaId: string): Promise<TurmaInscription | null> => {
  const response = await api.get(`/turma-inscriptions?userId=${userId}&turmaId=${turmaId}`);
  return response.data.length > 0 ? response.data[0] : null;
};

/**
 * Aprova uma inscrição em turma (Coordenador)
 */
export const approveTurmaInscription = async (inscriptionId: string, coordenadorId: string): Promise<TurmaInscription> => {
  const response = await api.patch(`/turma-inscriptions/${inscriptionId}`, {
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy: coordenadorId,
  });
  return response.data;
};

/**
 * Rejeita uma inscrição em turma (Coordenador)
 */
export const rejectTurmaInscription = async (
  inscriptionId: string, 
  coordenadorId: string, 
  reason?: string
): Promise<void> => {
  // Busca a inscrição para pegar o turmaId
  const inscription = await api.get(`/turma-inscriptions/${inscriptionId}`);
  const turmaId = inscription.data.turmaId;
  
  // Atualiza a inscrição para status 'rejected'
  await api.patch(`/turma-inscriptions/${inscriptionId}`, {
    status: 'rejected',
    rejectedAt: new Date().toISOString(),
    rejectedBy: coordenadorId,
    rejectionReason: reason
  });
  
  // Sincroniza o contador de inscritos (vai decrementar pois rejected não conta)
  await syncTurmaEnrolledCount(turmaId);
};

/**
 * Busca inscrições pendentes de uma turma
 */
export const getPendingInscriptionsByTurma = async (turmaId: string): Promise<TurmaInscription[]> => {
  const response = await api.get(`/turma-inscriptions?turmaId=${turmaId}&status=pending&_expand=user`);
  return response.data;
};

/**
 * Busca todas as inscrições pendentes (para coordenador)
 */
export const getAllPendingInscriptions = async (): Promise<TurmaInscription[]> => {
  const response = await api.get(`/turma-inscriptions?status=pending&_expand=user&_expand=turma`);
  return response.data;
};

/**
 * Ativa uma inscrição aprovada (quando a turma inicia)
 */
export const activateTurmaInscription = async (inscriptionId: string): Promise<TurmaInscription> => {
  const response = await api.patch(`/turma-inscriptions/${inscriptionId}`, {
    status: 'active',
  });
  return response.data;
};

/**
 * Cancela inscrição em uma turma
 */
export const cancelTurmaInscription = async (inscriptionId: string, turmaId: string): Promise<void> => {
  // Deleta a inscrição
  await api.delete(`/turma-inscriptions/${inscriptionId}`);
  
  // Sincroniza o contador de inscritos
  await syncTurmaEnrolledCount(turmaId);
};
