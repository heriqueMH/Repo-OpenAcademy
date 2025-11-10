import React, { useState, useEffect } from 'react';
import { FaEye, FaUsers, FaClock, FaCheckCircle, FaHourglassHalf, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Trilha, Turma } from '../types';
import { useAuth } from '../hooks';
import { TurmaFormModal } from '../components/modals';
import api from '../services/api';
import styles from './CoordinatorTrilhas.module.css';

interface TrilhaWithStats extends Trilha {
  totalTurmas: number;
  turmasEmAndamento: number;
  pendingInscriptions: number;
}

const CoordinatorTrilhas: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trilhas, setTrilhas] = useState<TrilhaWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrilha, setSelectedTrilha] = useState<Trilha | null>(null);
  const [showTrilhaDetails, setShowTrilhaDetails] = useState(false);
  const [turmasDetalhes, setTurmasDetalhes] = useState<Turma[]>([]);
  const [showTurmaForm, setShowTurmaForm] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);

  useEffect(() => {
    loadTrilhasWithStats();
  }, []);

  const loadTrilhasWithStats = async () => {
    try {
      setLoading(true);
      
      // Buscar trilhas
      const trilhasRes = await api.get('/trilhas');
      const trilhasData: Trilha[] = trilhasRes.data;

      // Buscar todas as turmas
      const turmasRes = await api.get('/turmas');
      const turmas: Turma[] = turmasRes.data;

      // Buscar inscrições
      const inscriptionsRes = await api.get('/turma-inscriptions');
      const inscriptions = inscriptionsRes.data;

      // Calcular estatísticas para cada trilha
      const trilhasWithStats: TrilhaWithStats[] = trilhasData.map(trilha => {
        const turmasDaTrilha = turmas.filter(t => t.trilhaId === trilha.id);
        const turmasEmAndamento = turmasDaTrilha.filter(
          t => t.status === 'em-andamento' || t.status === 'inscricoes-abertas'
        ).length;

        // Contar inscrições pendentes para todas as turmas desta trilha
        const turmaIds = turmasDaTrilha.map(t => t.id);
        const pendingInscriptions = inscriptions.filter(
          (i: any) => turmaIds.includes(i.turmaId) && i.status === 'pending'
        ).length;

        return {
          ...trilha,
          totalTurmas: turmasDaTrilha.length,
          turmasEmAndamento,
          pendingInscriptions
        };
      });

      setTrilhas(trilhasWithStats);
    } catch (error) {
      console.error('Erro ao carregar trilhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (trilha: Trilha) => {
    setSelectedTrilha(trilha);
    setShowTrilhaDetails(true);
    
    // Carregar turmas da trilha
    try {
      const [turmasRes, usersRes] = await Promise.all([
        api.get(`/turmas?trilhaId=${trilha.id}`),
        api.get('/users?role=mentor')
      ]);

      // Enriquecer turmas com dados do mentor
      const turmasEnriquecidas = turmasRes.data.map((turma: Turma) => {
        const mentor = usersRes.data.find((u: any) => u.id === turma.mentorId);
        return {
          ...turma,
          mentor: mentor ? { id: mentor.id, name: mentor.name } : undefined
        };
      });

      setTurmasDetalhes(turmasEnriquecidas);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const handleAddTurma = () => {
    setEditingTurma(null);
    setShowTurmaForm(true);
  };

  const handleEditTurma = (turma: Turma) => {
    setEditingTurma(turma);
    setShowTurmaForm(true);
  };

  const handleDeleteTurma = async (turma: Turma) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a turma "${turma.name}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/turmas/${turma.id}`);
      
      // Atualizar lista de turmas
      setTurmasDetalhes(prev => prev.filter(t => t.id !== turma.id));
      
      // Recarregar estatísticas
      loadTrilhasWithStats();
      
      alert('Turma excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      alert('Erro ao excluir turma. Tente novamente.');
    }
  };

  const handleSaveTurma = () => {
    setShowTurmaForm(false);
    setEditingTurma(null);
    
    // Recarregar turmas e estatísticas
    if (selectedTrilha) {
      handleViewDetails(selectedTrilha);
    }
    loadTrilhasWithStats();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getModalidadeLabel = (modalidade: string) => {
    const modalidadeMap: Record<string, string> = {
      'presencial': 'Presencial',
      'hibrida': 'Híbrida',
      'ead-sincrono': 'EAD Síncrono',
      'ead-assincrono': 'EAD Assíncrono'
    };
    return modalidadeMap[modalidade] || modalidade;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'planejada': { label: 'Planejada', className: styles.statusPlanejada },
      'inscricoes-abertas': { label: 'Inscrições Abertas', className: styles.statusAberta },
      'em-andamento': { label: 'Em Andamento', className: styles.statusAndamento },
      'concluida': { label: 'Concluída', className: styles.statusConcluida }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: '' };
    
    return (
      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gerenciamento de Turmas</h1>
          <p className={styles.subtitle}>
            Bem-vindo(a), {user?.name?.split(' ')[0]}! Gerencie as turmas das trilhas educacionais.
          </p>
        </div>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>{trilhas.length}</h3>
            <p>Trilhas Ativas</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaClock />
          </div>
          <div className={styles.statContent}>
            <h3>{trilhas.reduce((sum, t) => sum + t.turmasEmAndamento, 0)}</h3>
            <p>Turmas em Andamento</p>
          </div>
        </div>
        <div 
          className={`${styles.statCard} ${styles.clickable}`}
          onClick={() => navigate('/coordenador/aprovacoes')}
        >
          <div className={styles.statIcon}>
            <FaHourglassHalf />
          </div>
          <div className={styles.statContent}>
            <h3>{trilhas.reduce((sum, t) => sum + t.pendingInscriptions, 0)}</h3>
            <p>Aprovações Pendentes</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaCheckCircle />
          </div>
          <div className={styles.statContent}>
            <h3>{trilhas.reduce((sum, t) => sum + t.totalTurmas, 0)}</h3>
            <p>Total de Turmas</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tableHeader}>
          <h2>Trilhas Educacionais</h2>
        </div>

        <div className={styles.table}>
          <div className={styles.tableHead}>
            <div className={styles.tableRow}>
              <div className={styles.tableCell}>Trilha</div>
              <div className={styles.tableCell}>Categoria</div>
              <div className={styles.tableCell}>Total de Turmas</div>
              <div className={styles.tableCell}>Em Andamento</div>
              <div className={styles.tableCell}>Aprovações Pendentes</div>
              <div className={styles.tableCell}>Ações</div>
            </div>
          </div>
          <div className={styles.tableBody}>
            {trilhas.map(trilha => (
              <div key={trilha.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div className={styles.trilhaInfo}>
                    <img 
                      src={trilha.thumbnail} 
                      alt={trilha.title}
                      className={styles.thumbnail}
                    />
                    <div>
                      <div className={styles.trilhaTitle}>{trilha.title}</div>
                      <div className={styles.trilhaLevel}>{trilha.level}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.tableCell}>{trilha.category}</div>
                <div className={styles.tableCell}>
                  <span className={styles.badge}>{trilha.totalTurmas}</span>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.badgeSuccess}>{trilha.turmasEmAndamento}</span>
                </div>
                <div className={styles.tableCell}>
                  {trilha.pendingInscriptions > 0 ? (
                    <span className={styles.badgeWarning}>{trilha.pendingInscriptions}</span>
                  ) : (
                    <span className={styles.badgeMuted}>0</span>
                  )}
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleViewDetails(trilha)}
                      className={styles.btnView}
                      title="Ver turmas"
                    >
                      <FaEye /> Ver Turmas
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTrilhaDetails && selectedTrilha && (
        <div className={styles.modalOverlay} onClick={() => setShowTrilhaDetails(false)}>
          <div className={styles.modalDetails} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>{selectedTrilha.title}</h2>
                <p className={styles.modalSubtitle}>{selectedTrilha.category} • {selectedTrilha.level}</p>
              </div>
              <button 
                onClick={handleAddTurma}
                className={styles.btnAddTurma}
              >
                <FaPlus /> Nova Turma
              </button>
            </div>

            <div className={styles.turmasList}>
              {turmasDetalhes.length === 0 ? (
                <div className={styles.emptyTurmas}>
                  <p>Nenhuma turma cadastrada para esta trilha.</p>
                  <button onClick={handleAddTurma} className={styles.btnAddFirst}>
                    <FaPlus /> Adicionar Primeira Turma
                  </button>
                </div>
              ) : (
                turmasDetalhes.map(turma => (
                  <div key={turma.id} className={styles.turmaCard}>
                    <div className={styles.turmaCardHeader}>
                      <div>
                        <h4>{turma.name}</h4>
                        {getStatusBadge(turma.status)}
                      </div>
                      <div className={styles.turmaActions}>
                        <button
                          onClick={() => handleEditTurma(turma)}
                          className={styles.btnEdit}
                          title="Editar turma"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteTurma(turma)}
                          className={styles.btnDelete}
                          title="Excluir turma"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className={styles.turmaCardBody}>
                      <p><strong>Modalidade:</strong> {getModalidadeLabel(turma.modalidade)}</p>
                      {turma.mentor?.name && (
                        <p><strong>Mentor:</strong> {turma.mentor.name}</p>
                      )}
                      {turma.location && (
                        <p><strong>Localização:</strong> {turma.location}</p>
                      )}
                      {turma.horario && (
                        <p><strong>Horário:</strong> {turma.horario}</p>
                      )}
                      <p><strong>Início:</strong> {formatDate(turma.startDate)}</p>
                      <p><strong>Término:</strong> {formatDate(turma.endDate)}</p>
                      <p><strong>Capacidade:</strong> {turma.enrolledCount}/{turma.maxStudents} alunos</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => setShowTrilhaDetails(false)} className={styles.btnCloseModal}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showTurmaForm && selectedTrilha && (
        <TurmaFormModal
          isOpen={showTurmaForm}
          onClose={() => {
            setShowTurmaForm(false);
            setEditingTurma(null);
          }}
          onSave={handleSaveTurma}
          turma={editingTurma}
          trilha={selectedTrilha}
        />
      )}
    </div>
  );
};

export default CoordinatorTrilhas;
