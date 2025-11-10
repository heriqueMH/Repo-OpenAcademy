import { useState } from 'react';
import { Turma, TurmaInscription } from '../types';
import { 
  getTurmasByTrilha, 
  getTurmasDisponiveis, 
  enrollInTurma, 
  checkTurmaInscription,
  getUserTurmaInscriptionsWithDetails 
} from '../services';
import { useAuth } from '../contexts/AuthContext';

export const useTurmas = (trilhaId?: string) => {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [userInscriptions, setUserInscriptions] = useState<TurmaInscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  // Carregar turmas da trilha
  const loadTurmas = async (id: string, onlyAvailable: boolean = false) => {
    try {
      setLoading(true);
      setError('');
      const data = onlyAvailable 
        ? await getTurmasDisponiveis(id)
        : await getTurmasByTrilha(id);
      setTurmas(data);
    } catch (err) {
      console.error('Erro ao carregar turmas:', err);
      setError('Erro ao carregar turmas disponíveis');
    } finally {
      setLoading(false);
    }
  };

  // Carregar inscrições do usuário
  const loadUserInscriptions = async () => {
    if (!user?.id) return;
    
    try {
      const data = await getUserTurmaInscriptionsWithDetails(user.id);
      setUserInscriptions(data);
    } catch (err) {
      console.error('Erro ao carregar inscrições:', err);
    }
  };

  // Verificar se usuário está inscrito em uma turma específica
  const isEnrolledInTurma = (turmaId: string): boolean => {
    return userInscriptions.some(inscription => inscription.turmaId === turmaId);
  };

  // Inscrever em uma turma
  const handleEnroll = async (turmaId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('Você precisa estar logado para se inscrever');
      return false;
    }

    try {
      setEnrolling(true);
      setError('');

      // Verifica se já está inscrito
      const existingInscription = await checkTurmaInscription(user.id, turmaId);
      if (existingInscription) {
        setError('Você já está inscrito nesta turma');
        return false;
      }

      // Faz a inscrição
      await enrollInTurma(user.id, turmaId);

      // Recarrega as listas
      await Promise.all([
        trilhaId ? loadTurmas(trilhaId) : Promise.resolve(),
        loadUserInscriptions()
      ]);

      return true;
    } catch (err: any) {
      console.error('Erro ao inscrever:', err);
      setError(err.message || 'Erro ao realizar inscrição');
      return false;
    } finally {
      setEnrolling(false);
    }
  };

  // NÃO carregamos dados automaticamente para evitar bugs de modal abrindo sozinho
  // O componente que usar o hook deve chamar loadTurmas() e loadUserInscriptions() explicitamente

  return {
    turmas,
    userInscriptions,
    loading,
    enrolling,
    error,
    loadTurmas,
    loadUserInscriptions,
    handleEnroll,
    isEnrolledInTurma,
    setError,
  };
};
