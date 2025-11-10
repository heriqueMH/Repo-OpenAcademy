import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById } from '../services/api';
import { getUserTurmaInscriptionsWithDetails } from '../services/turma.service';
import { TurmaInscription } from '../types/turma.types';
import { FaBook, FaClock, FaUser, FaCalendar, FaChartLine, FaSearch, FaUserCheck } from 'react-icons/fa';
import styles from './MyInscriptionsPage.module.css';

const MyInscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState<TurmaInscription[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // GET - Carregar dados frescos do usuário do banco
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        const data = await getUserById(user.id);
        setUserData(data);
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
      }
    };

    loadUserData();
  }, [user?.id]);

  // GET - Carregar inscrições do usuário e dados das trilhas
  useEffect(() => {
    const loadInscriptions = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        console.log('📚 Carregando inscrições em turmas para usuário:', user.id);
        // Usa a função que busca inscrições em turmas (turma-inscriptions)
        const data = await getUserTurmaInscriptionsWithDetails(user.id);
        console.log('✅ Inscrições em turmas carregadas:', data);
        setInscriptions(data);
      } catch (err) {
        console.error('❌ Erro ao carregar inscrições:', err);
        setError('Erro ao carregar inscrições.');
      } finally {
        setLoading(false);
      }
    };

    loadInscriptions();
  }, [user?.id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando inscrições...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>Minhas Inscrições</h1>
            <p>Visualize suas inscrições em trilhas educacionais</p>
          </div>
          <button className={styles.exploreCatalogBtn} onClick={() => navigate('/catalog')}>
            <FaSearch />
            <span>Ver Outras Trilhas</span>
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {inscriptions.length === 0 ? (
        <div className={styles.empty}>
          <FaBook className={styles.emptyIcon} />
          <h3>Nenhuma inscrição encontrada</h3>
          <p>Você ainda não se inscreveu em nenhuma trilha.</p>
        </div>
      ) : (
        <div className={styles.inscriptionsList}>
          {inscriptions.map(inscription => {
            const isCompleted = inscription.progress >= 100;
            const turma = inscription.turma;
            
            return (
              <div key={inscription.id} className={styles.inscriptionCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>{turma?.trilha?.title || 'Trilha'}</h3>
                    <p className={styles.turmaSubtitle}>
                      Turma: {turma?.name || 'Carregando...'}
                    </p>
                    <span className={`${styles.status} ${styles[inscription.status]}`}>
                      {inscription.status === 'pending' && 'Aguardando Aprovação'}
                      {inscription.status === 'approved' && 'Aprovado'}
                      {inscription.status === 'active' && 'Cursando'}
                      {inscription.status === 'completed' && 'Concluído'}
                      {inscription.status === 'rejected' && 'Rejeitado'}
                    </span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Nome:</span>
                      <span className={styles.value}>{userData?.name || 'Não informado'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>CPF:</span>
                      <span className={styles.value}>{userData?.cpf || 'Não informado'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Educação:</span>
                      <span className={styles.value}>{userData?.education || 'Não informado'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Data de Inscrição:</span>
                      <span className={styles.value}>
                        {new Date(inscription.inscriptionDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Nova seção: Detalhes da Turma */}
                  <div className={styles.trilhaDetails}>
                    <h4 className={styles.sectionTitle}>Detalhes da Turma</h4>
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <FaUser className={styles.detailIcon} />
                        <div>
                          <span className={styles.detailLabel}>Modalidade</span>
                          <span className={styles.detailValue}>{turma?.modalidade || 'Não informado'}</span>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <FaClock className={styles.detailIcon} />
                        <div>
                          <span className={styles.detailLabel}>Horário</span>
                          <span className={styles.detailValue}>{turma?.horario || 'Não informado'}</span>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <FaChartLine className={styles.detailIcon} />
                        <div>
                          <span className={styles.detailLabel}>Status</span>
                          <span className={styles.detailValue}>
                            {turma?.status === 'inscricoes-abertas' && 'Inscrições Abertas'}
                            {turma?.status === 'em-andamento' && 'Em Andamento'}
                            {turma?.status === 'concluida' && 'Concluída'}
                            {turma?.status === 'planejada' && 'Planejada'}
                            {!turma?.status && 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <FaCalendar className={styles.detailIcon} />
                        <div>
                          <span className={styles.detailLabel}>Início</span>
                          <span className={styles.detailValue}>
                            {turma?.startDate 
                              ? new Date(turma.startDate).toLocaleDateString('pt-BR')
                              : 'Não informado'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <FaCalendar className={styles.detailIcon} />
                        <div>
                          <span className={styles.detailLabel}>Término</span>
                          <span className={styles.detailValue}>
                            {turma?.endDate 
                              ? new Date(turma.endDate).toLocaleDateString('pt-BR')
                              : 'Não informado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <FaClock />
                      <span>Progresso do Curso</span>
                    </div>
                    
                    <div className={styles.progressBar}>
                      <div className={`${styles.progressFill} ${styles[`progress${Math.round(inscription.progress / 5) * 5}`]}`} />
                    </div>
                    <span className={styles.progressPercent}>{inscription.progress}%</span>
                  </div>

                  {/* Seção de Frequência */}
                  {inscription.attendance !== undefined && (
                    <div className={styles.progressSection}>
                      <div className={styles.progressHeader}>
                        <FaUserCheck />
                        <span>Frequência</span>
                      </div>
                      
                      <div className={styles.progressBar}>
                        <div className={`${styles.progressFill} ${styles[`progress${Math.round(inscription.attendance / 5) * 5}`]}`} />
                      </div>
                      <span className={styles.progressPercent}>{inscription.attendance}%</span>
                    </div>
                  )}

                  {/* Botão de Emitir Certificado - Desabilitado temporariamente até termos a trilha */}
                  {isCompleted && turma && (
                    <div className={styles.certificateSection}>
                      <p className={styles.certificateInfo}>
                        ✅ Parabéns! Você concluiu esta turma. Em breve o certificado estará disponível.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyInscriptionsPage;
