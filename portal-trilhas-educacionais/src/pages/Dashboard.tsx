import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaTrophy, FaBook, FaSearch, FaCertificate } from 'react-icons/fa';
import { getUserById } from '../services/api';
import { getUserTurmaInscriptionsWithDetails } from '../services/turma.service';
import styles from './Dashboard.module.css';

interface ProgressBarProps {
    progresso: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progresso }) => {
    const progressClass = `progress${Math.round(progresso / 5) * 5}`; // Round to nearest 5
    return (
        <div className={styles.progressBar}>
            <div className={`${styles.progressFill} ${styles[progressClass]}`} />
        </div>
    );
};

interface TrilhaProgresso {
    id: string;
    titulo: string;
    progresso: number;
    frequencia?: number; // Frequência 0-100
    proximaAula: string;
    tempoRestante: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        trilhasInscritas: 0,
        trilhasConcluidas: 0,
        totalInscricoes: 0
    });
    const [trilhasEmProgresso, setTrilhasEmProgresso] = useState<TrilhaProgresso[]>([]);
    const [atividadesRecentes, setAtividadesRecentes] = useState<any[]>([]);

    // Buscar dados frescos do usuário
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

    const loadDashboardData = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            console.log('📊 Carregando dados do dashboard para usuário:', user.id);
            
            // Carregar inscrições em turmas do usuário (com detalhes da turma e trilha)
            const inscriptionsData = await getUserTurmaInscriptionsWithDetails(user.id);
            console.log('✅ Inscrições carregadas:', inscriptionsData);

            // Filtrar inscrições ativas (em progresso) - status active ou approved
            const activeInscriptions = inscriptionsData.filter(
                (insc: any) => 
                    (insc.status === 'active' || insc.status === 'approved') && 
                    insc.progress < 100
            );
            
            // Filtrar inscrições concluídas
            const completedInscriptions = inscriptionsData.filter(
                (insc: any) => insc.status === 'completed' || insc.progress >= 100
            );

            // Mapear trilhas em progresso com dados da turma
            const trilhasComDetalhes = activeInscriptions.map((inscription: any) => {
                const turma = inscription.turma;
                return {
                    id: inscription.id,
                    titulo: `${turma?.name || 'Turma'} - ${turma?.trilha?.title || 'Carregando...'}`,
                    progresso: inscription.progress || 0,
                    frequencia: inscription.attendance,
                    proximaAula: turma?.modalidade === 'Presencial' 
                        ? `${turma.horario} - ${turma.local}` 
                        : 'Aula Online',
                    tempoRestante: turma?.endDate 
                        ? `Término: ${new Date(turma.endDate).toLocaleDateString('pt-BR')}`
                        : 'A definir'
                };
            });

            setTrilhasEmProgresso(trilhasComDetalhes);

            // Atividades recentes não existem mais no banco
            setAtividadesRecentes([]);

            // Calcular estatísticas
            setStats({
                trilhasInscritas: activeInscriptions.length,
                trilhasConcluidas: completedInscriptions.length,
                totalInscricoes: inscriptionsData.length
            });

        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.id) {
            loadDashboardData();
        }
    }, [user, loadDashboardData]);

    const formatarTempoPassado = (timestamp: string) => {
        const agora = new Date();
        const data = new Date(timestamp);
        const diffMs = agora.getTime() - data.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMs / 3600000);
        const diffDias = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `Há ${diffMins} minutos`;
        if (diffHoras < 24) return `Há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
        return `Há ${diffDias} dia${diffDias > 1 ? 's' : ''}`;
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1>Olá, {userData?.name?.split(' ')[0] || 'Aluno'}! 👋</h1>
                    <p>Bem-vindo ao seu painel de aprendizado</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.red}`}>
                        <FaGraduationCap />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.trilhasInscritas}</div>
                        <div className={styles.statLabel}>Trilhas Ativas</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.green}`}>
                        <FaTrophy />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.trilhasConcluidas}</div>
                        <div className={styles.statLabel}>Trilhas Concluídas</div>
                    </div>
                </div>
            </div>

            {/* Botão para explorar turmas */}
            {trilhasEmProgresso.length === 0 && !loading && (
                <div className={styles.exploreCatalog}>
                    <FaSearch className={styles.exploreIcon} />
                    <h3>Comece sua jornada de aprendizado!</h3>
                    <p>Explore nossas turmas disponíveis e inscreva-se agora</p>
                    <button 
                        className={styles.exploreCatalogBtn}
                        onClick={() => navigate('/catalog')}
                    >
                        Explorar Turmas
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Trilhas em Progresso */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>
                            <FaBook /> Trilhas em Progresso
                        </h2>
                    </div>
                    <div className={styles.trilhasList}>
                        {loading ? (
                            <p className={styles.emptyState}>Carregando trilhas...</p>
                        ) : trilhasEmProgresso.length === 0 ? (
                            <div className={styles.emptyCatalogPrompt}>
                                <p className={styles.emptyState}>Você ainda não está inscrito em nenhuma trilha ativa</p>
                                <button
                                    className={styles.exploreCatalogBtnSmall}
                                    onClick={() => navigate('/catalog')}
                                >
                                    <FaSearch /> Explorar Turmas
                                </button>
                            </div>
                        ) : (
                            trilhasEmProgresso.map(trilha => {
                                const isCompleted = trilha.progresso >= 100;
                                return (
                                    <div key={trilha.id} className={styles.trilhaCard}>
                                        <div className={styles.trilhaHeader}>
                                            <h3>{trilha.titulo}</h3>
                                            <span className={styles.progressPercent}>{trilha.progresso}%</span>
                                        </div>
                                        <ProgressBar progresso={trilha.progresso} />
                                        
                                        {/* Frequência */}
                                        {trilha.frequencia !== undefined && (
                                            <div className={styles.attendanceSection}>
                                                <div className={styles.attendanceHeader}>
                                                    <span className={styles.attendanceLabel}>Frequência:</span>
                                                    <span className={styles.attendancePercent}>{trilha.frequencia}%</span>
                                                </div>
                                                <div className={styles.progressBar}>
                                                    <div className={`${styles.progressFill} ${styles[`progress${Math.round(trilha.frequencia / 5) * 5}`]}`} />
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className={styles.trilhaInfo}>
                                            <div className={styles.trilhaDetail}>
                                                <span className={styles.label}>Próxima aula:</span>
                                                <span className={styles.value}>{trilha.proximaAula}</span>
                                            </div>
                                            <div className={styles.trilhaDetail}>
                                                <span className={styles.label}>Tempo restante:</span>
                                                <span className={styles.value}>{trilha.tempoRestante}</span>
                                            </div>
                                        </div>
                                        {isCompleted ? (
                                            <button className={`${styles.continueBtn} ${styles.certificateBtn}`}>
                                                <FaCertificate /> Emitir Certificado
                                            </button>
                                        ) : (
                                            <button className={styles.continueBtn}>Continuar Estudando</button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Atividades Recentes */}
                <div className={styles.sidebar}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Atividades Recentes</h2>
                        </div>
                        <div className={styles.activityList}>
                            {loading ? (
                                <p className={styles.emptyState}>Carregando...</p>
                            ) : atividadesRecentes.length === 0 ? (
                                <p className={styles.emptyState}>Nenhuma atividade recente</p>
                            ) : (
                                atividadesRecentes.map((atividade) => (
                                    <div key={atividade.id} className={styles.activityItem}>
                                        <div className={`${styles.activityIcon} ${styles[atividade.tipo]}`}>
                                            {atividade.tipo === 'conclusao' && '✓'}
                                            {atividade.tipo === 'certificado' && '🎓'}
                                            {atividade.tipo === 'inscricao' && '📚'}
                                            {atividade.tipo === 'conquista' && '🏆'}
                                        </div>
                                        <div className={styles.activityContent}>
                                            <p>{atividade.descricao}</p>
                                            <span className={styles.activityTime}>
                                                {formatarTempoPassado(atividade.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;