import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaUser, FaBook, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../hooks';
import { approveTurmaInscription, rejectTurmaInscription } from '../services/turma.service';
import api from '../services/api';
import styles from './PendingEnrollments.module.css';

interface PendingInscription {
  id: string;
  userId: string;
  turmaId: string;
  inscriptionDate: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
    education?: string;
    isMackenzieStudent?: boolean;
    mackenzieData?: {
      course?: string;
      semester?: number;
      campus?: string;
    };
  };
  turma: {
    id: string;
    name: string;
    location: string;
    startDate: string;
    endDate: string;
    trilha: {
      id: string;
      title: string;
      level: string;
      category: string;
    };
  };
}

const PendingEnrollments: React.FC = () => {
  const { user } = useAuth();
  const [pendingInscriptions, setPendingInscriptions] = useState<PendingInscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInscription, setSelectedInscription] = useState<PendingInscription | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingInscriptions();
  }, []);

  const loadPendingInscriptions = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as inscrições pendentes
      const inscriptionsRes = await api.get('/turma-inscriptions?status=pending');
      const inscriptions = inscriptionsRes.data;

      // Buscar dados de usuários, turmas e trilhas
      const [usersRes, turmasRes, trilhasRes] = await Promise.all([
        api.get('/users'),
        api.get('/turmas'),
        api.get('/trilhas')
      ]);

      // Montar array com dados completos
      const enrichedInscriptions: PendingInscription[] = inscriptions
        .map((inscription: any) => {
          const userData = usersRes.data.find((u: any) => u.id === inscription.userId);
          const turmaData = turmasRes.data.find((t: any) => t.id === inscription.turmaId);
          const trilhaData = trilhasRes.data.find((tr: any) => tr.id === turmaData?.trilhaId);

          // Só retornar se todos os dados necessários existirem
          if (!userData || !turmaData || !trilhaData) {
            console.warn('Dados incompletos para inscrição:', inscription.id);
            return null;
          }

          return {
            ...inscription,
            user: userData,
            turma: {
              ...turmaData,
              trilha: trilhaData
            }
          };
        })
        .filter((item: PendingInscription | null): item is PendingInscription => item !== null);

      setPendingInscriptions(enrichedInscriptions);
    } catch (error) {
      console.error('Erro ao carregar inscrições pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (inscription: PendingInscription) => {
    if (!user?.id) return;

    try {
      setProcessing(true);
      await approveTurmaInscription(inscription.id, user.id);
      
      // Remover da lista
      setPendingInscriptions(prev => prev.filter(i => i.id !== inscription.id));
      
      alert(`Inscrição de ${inscription.user.name} aprovada com sucesso!`);
    } catch (error) {
      console.error('Erro ao aprovar inscrição:', error);
      alert('Erro ao aprovar inscrição. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (inscription: PendingInscription) => {
    setSelectedInscription(inscription);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedInscription || !user?.id) return;

    if (!rejectionNotes.trim()) {
      alert('Por favor, informe o motivo da reprovação.');
      return;
    }

    try {
      setProcessing(true);
      await rejectTurmaInscription(selectedInscription.id, user.id, rejectionNotes);
      
      // Remover da lista
      setPendingInscriptions(prev => prev.filter(i => i.id !== selectedInscription.id));
      
      alert(`Inscrição de ${selectedInscription.user.name} reprovada.`);
      setShowRejectModal(false);
      setRejectionNotes('');
      setSelectedInscription(null);
    } catch (error) {
      console.error('Erro ao reprovar inscrição:', error);
      alert('Erro ao reprovar inscrição. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando inscrições pendentes...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Aprovações Pendentes</h1>
        <p className={styles.subtitle}>
          {pendingInscriptions.length} {pendingInscriptions.length === 1 ? 'solicitação' : 'solicitações'} aguardando análise
        </p>
      </div>

      {pendingInscriptions.length === 0 ? (
        <div className={styles.emptyState}>
          <FaCheckCircle className={styles.emptyIcon} />
          <h2>Nenhuma aprovação pendente</h2>
          <p>Todas as inscrições foram processadas!</p>
        </div>
      ) : (
        <div className={styles.inscriptionsList}>
          {pendingInscriptions.map(inscription => (
            <div key={inscription.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.trilhaInfo}>
                  <h3>{inscription.turma.trilha.title}</h3>
                  <div className={styles.badges}>
                    <span className={styles.badge}>{inscription.turma.trilha.category}</span>
                    <span className={styles.badgeLevel}>{inscription.turma.trilha.level}</span>
                  </div>
                </div>
                <div className={styles.inscriptionDate}>
                  <FaClock />
                  <span>Solicitado em {formatDate(inscription.inscriptionDate)}</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.section}>
                  <h4><FaBook /> Turma</h4>
                  <p className={styles.turmaName}>{inscription.turma.name}</p>
                  <p className={styles.detail}>
                    <FaMapMarkerAlt /> {inscription.turma.location}
                  </p>
                  <p className={styles.detail}>
                    Início: {formatDate(inscription.turma.startDate)} • Término: {formatDate(inscription.turma.endDate)}
                  </p>
                </div>

                <div className={styles.section}>
                  <h4><FaUser /> Dados do Aluno</h4>
                  <p className={styles.userName}>{inscription.user.name}</p>
                  <p className={styles.detail}>Email: {inscription.user.email}</p>
                  {inscription.user.phone && <p className={styles.detail}>Telefone: {inscription.user.phone}</p>}
                  {inscription.user.education && (
                    <p className={styles.detail}>Escolaridade: {inscription.user.education}</p>
                  )}
                  
                  {inscription.user.isMackenzieStudent && inscription.user.mackenzieData && (
                    <div className={styles.mackenzieInfo}>
                      <p className={styles.detail}>
                        <strong>Aluno Mackenzie:</strong> {inscription.user.mackenzieData.course || 'N/A'}
                      </p>
                      <p className={styles.detail}>
                        Semestre: {inscription.user.mackenzieData.semester || 'N/A'} • 
                        Campus: {inscription.user.mackenzieData.campus || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button
                  onClick={() => handleApprove(inscription)}
                  className={styles.btnApprove}
                  disabled={processing}
                >
                  <FaCheckCircle /> Aprovar
                </button>
                <button
                  onClick={() => handleRejectClick(inscription)}
                  className={styles.btnReject}
                  disabled={processing}
                >
                  <FaTimesCircle /> Reprovar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Reprovação */}
      {showRejectModal && selectedInscription && (
        <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Reprovar Inscrição</h2>
            <p className={styles.modalText}>
              Aluno: <strong>{selectedInscription.user.name}</strong>
            </p>
            <p className={styles.modalText}>
              Turma: <strong>{selectedInscription.turma.name}</strong>
            </p>
            
            <label className={styles.label}>
              Motivo da reprovação:
              <textarea
                className={styles.textarea}
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Explique o motivo da reprovação..."
                rows={4}
              />
            </label>

            <div className={styles.modalActions}>
              <button
                onClick={handleRejectConfirm}
                className={styles.btnConfirmReject}
                disabled={processing || !rejectionNotes.trim()}
              >
                Confirmar Reprovação
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionNotes('');
                }}
                className={styles.btnCancel}
                disabled={processing}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingEnrollments;
