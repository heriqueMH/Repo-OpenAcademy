import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:25000', // URL base do backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função para obter todas as trilhas
export const getTrilhas = async () => {
  const response = await api.get('/trilhas');
  return response.data;
};

// Função para obter trilhas com dados do mentor populados
export const getTrilhasWithMentor = async () => {
  const trilhas = await getTrilhas();
  const users = await api.get('/users');
  
  return trilhas.map((trilha: any) => {
    const mentor = users.data.find((u: any) => u.id === trilha.mentorId);
    return {
      ...trilha,
      mentor: mentor ? {
        id: mentor.id,
        name: mentor.name,
        avatar: mentor.avatar
      } : null
    };
  });
};

// Função para obter uma trilha específica
export const getTrilhaById = async (id: string) => {
  console.log(`🔍 Buscando trilha com ID: ${id}`);
  try {
    const response = await api.get(`/trilhas/${id}`);
    console.log(`✅ Trilha ${id} encontrada:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao buscar trilha ${id}:`, error);
    throw error;
  }
};

// Função para obter trilha com dados do mentor
export const getTrilhaWithMentor = async (id: string) => {
  try {
    const trilha = await getTrilhaById(id);
    if (!trilha) {
      console.warn(`⚠️ Trilha ${id} não encontrada`);
      return null;
    }
    
    if (trilha.mentorId) {
      try {
        const mentor = await getUserById(trilha.mentorId);
        trilha.mentor = {
          id: mentor.id,
          name: mentor.name,
          avatar: mentor.avatar
        };
      } catch (error) {
        console.warn(`⚠️ Mentor ${trilha.mentorId} não encontrado para trilha ${id}`);
        trilha.mentor = null;
      }
    }
    return trilha;
  } catch (error) {
    console.error(`❌ Erro ao buscar trilha ${id}:`, error);
    return null;
  }
};

// Função para criar uma nova trilha
export const createTrilha = async (trilhaData: any) => {
  const response = await api.post('/trilhas', trilhaData);
  return response.data;
};

// Função para atualizar uma trilha existente
export const updateTrilha = async (id: string, trilhaData: any) => {
  const response = await api.put(`/trilhas/${id}`, trilhaData);
  return response.data;
};

// Função para deletar uma trilha
export const deleteTrilha = async (id: string) => {
  const response = await api.delete(`/trilhas/${id}`);
  return response.data;
};

// Função para obter dados do usuário
export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Função para atualizar dados do usuário
export const updateUser = async (id: string, userData: any) => {
  const response = await api.patch(`/users/${id}`, userData);
  return response.data;
};

// Função para atualizar avatar do usuário
export const updateUserAvatar = async (id: string, avatarUrl: string) => {
  const response = await api.patch(`/users/${id}`, { avatar: avatarUrl });
  return response.data;
};

// ===== INSCRIÇÕES (INSCRIPTIONS) =====

// Função para obter todas as inscrições de um usuário
export const getUserInscriptions = async (userId: string) => {
  const response = await api.get(`/inscriptions?userId=${userId}`);
  return response.data;
};

// Função para obter inscrições com dados completos (trilha + mentor)
export const getUserInscriptionsWithDetails = async (userId: string) => {
  console.log(`📋 Buscando inscrições detalhadas para usuário: ${userId}`);
  const inscriptions = await getUserInscriptions(userId);
  console.log(`📦 Inscrições encontradas (antes de popular):`, inscriptions);
  
  const result = await Promise.all(inscriptions.map(async (inscription: any) => {
    try {
      console.log(`🔄 Populando dados da trilha ${inscription.trilhaId}...`);
      const trilha = await getTrilhaWithMentor(inscription.trilhaId);
      console.log(`✅ Trilha ${inscription.trilhaId} populada:`, trilha);
      
      return {
        ...inscription,
        trilha,
        // Compatibilidade com código legado - adiciona campos que podem estar ausentes
        frequency: inscription.frequency ? `${inscription.frequency}%` : 'N/A',
        totalHours: trilha?.duration || 0,
        mentor: trilha?.mentor?.name || 'Não informado',
        startDate: inscription.startDate || inscription.createdAt,
        endDate: inscription.endDate || null,
        modulesCompleted: inscription.modulesCompleted || 0,
        totalModules: inscription.totalModules || 0
      };
    } catch (error) {
      console.error(`Erro ao carregar trilha ${inscription.trilhaId}:`, error);
      // Retorna inscrição sem dados da trilha
      return {
        ...inscription,
        trilha: null,
        frequency: inscription.frequency ? `${inscription.frequency}%` : 'N/A',
        totalHours: 0,
        mentor: 'Não informado',
        startDate: inscription.startDate || inscription.createdAt,
        endDate: inscription.endDate || null,
        modulesCompleted: inscription.modulesCompleted || 0,
        totalModules: inscription.totalModules || 0
      };
    }
  }));
  
  console.log(`📊 Inscrições detalhadas finais:`, result);
  return result;
};

// Função para obter uma inscrição específica
export const getInscriptionById = async (id: string) => {
  const response = await api.get(`/inscriptions/${id}`);
  return response.data;
};

// Função para criar uma nova inscrição
export const createInscription = async (inscriptionData: any) => {
  const response = await api.post('/inscriptions', {
    ...inscriptionData,
    createdAt: new Date().toISOString(),
    status: 'active',
    progress: 0
  });
  return response.data;
};

// Função para atualizar uma inscrição existente
export const updateInscription = async (id: string, inscriptionData: any) => {
  const response = await api.patch(`/inscriptions/${id}`, inscriptionData);
  return response.data;
};

// Função para deletar uma inscrição
export const deleteInscription = async (id: string) => {
  const response = await api.delete(`/inscriptions/${id}`);
  return response.data;
};

// Função para verificar se usuário já está inscrito em uma trilha
export const checkInscription = async (userId: string, trilhaId: string) => {
  const response = await api.get(`/inscriptions?userId=${userId}&trilhaId=${trilhaId}`);
  return response.data.length > 0 ? response.data[0] : null;
};

// ===== DASHBOARD & ESTATÍSTICAS =====

// Função para calcular estatísticas do dashboard dinamicamente
export const calculateDashboardStats = async (userId: string) => {
  const inscriptions = await getUserInscriptions(userId);
  const trilhas = await getTrilhas();
  
  const trilhasInscritas = inscriptions.length;
  const trilhasConcluidas = inscriptions.filter((i: any) => i.status === 'completed').length;
  
  // Calcular horas estudadas (soma da duração das trilhas inscritas)
  const horasEstudadas = inscriptions.reduce((sum: number, i: any) => {
    const trilha = trilhas.find((t: any) => t.id === i.trilhaId);
    return sum + (trilha?.duration || 0);
  }, 0);
  
  return {
    trilhasInscritas,
    trilhasConcluidas,
    horasEstudadas,
    certificados: trilhasConcluidas, // Um certificado por trilha concluída
  };
};

// Função para obter estatísticas do dashboard do usuário
export const getDashboardStats = async (userId: string) => {
  // Sempre calcula dinamicamente (não há mais tabela dashboard-stats)
  return calculateDashboardStats(userId);
};

// Função para obter dados completos do dashboard
export const getDashboardData = async (userId: string) => {
  try {
    const stats = await getDashboardStats(userId);

    return {
      stats,
      trilhasEmProgresso: [],
      atividadesRecentes: [],
      conquistasBadges: [],
    };
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
    throw error;
  }
};

// ========================
// FUNÇÕES ADMIN
// ========================

// Função para obter todos os usuários (Admin)
export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Função para obter todas as trilhas (alias para getTrilhas)
export const getAllTrilhas = getTrilhas;

// Função para obter todas as inscrições (Admin)
export const getAllInscriptions = async () => {
  const response = await api.get('/inscriptions');
  return response.data;
};

// Função para deletar usuário (Admin)
export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Função para atualizar role do usuário (Admin)
export const updateUserRole = async (id: string, role: string) => {
  const response = await api.patch(`/users/${id}`, { role });
  return response.data;
};

export default api;