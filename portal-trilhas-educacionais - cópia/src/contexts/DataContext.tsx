import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trilha, UserProgress, DataContextType } from '../types';
import { useAuth } from './AuthContext';
import { getTrilhasWithMentor } from '../services/api';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar trilhas do servidor com dados do mentor
  useEffect(() => {
    const loadTrilhas = async () => {
      try {
        setLoading(true);
        const data = await getTrilhasWithMentor();
        setTrilhas(data);
      } catch (error) {
        console.error('Erro ao carregar trilhas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrilhas();
  }, []);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  // Busca uma trilha por ID
  const getTrilhaById = (id: string): Trilha | undefined => {
    return trilhas.find((trilha) => trilha.id === id);
  };

  // Busca o progresso do usuário em uma trilha
  const getUserProgress = (trilhaId: string): UserProgress | undefined => {
    return userProgress.find((progress) => progress.trilhaId === trilhaId);
  };

  // RF008/RF009: Inscrição em trilha (requer verificação)
  const enrollInTrilha = async (trilhaId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!user) {
          reject(new Error('Usuário não autenticado'));
          return;
        }

        // Esta validação será feita no componente EnrollButton
        // Aqui apenas registramos a inscrição
        
        // Mock: Simula chamada ao backend Java
        // Em produção: await axios.post('/api/enrollments', { trilhaId })
        
        const newProgress: UserProgress = {
          trilhaId,
          progress: 0,
          lastAccessedAt: new Date().toISOString(),
        };
        
        setUserProgress((prev) => [...prev, newProgress]);
        resolve();
      }, 1000);
    });
  };

  return (
    <DataContext.Provider
      value={{
        trilhas,
        userProgress,
        getTrilhaById,
        enrollInTrilha,
        getUserProgress,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Hook customizado para usar o DataContext
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};
