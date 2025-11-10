import React, { useState, useEffect } from 'react';
import { FaSearch, FaHistory, FaUser, FaBook, FaClock, FaEdit, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaFilter, FaCalendar } from 'react-icons/fa';
import api from '../services/api';
import styles from './InscriptionLogs.module.css';

interface InscriptionLog {
  id: string;
  userId: string;
  turmaId: string;
  trilhaId?: string;
  trilhaTitle?: string;
  turmaName?: string;
  userName?: string;
  userEmail?: string;
  inscriptionDate: string;
  status: 'pending' | 'active' | 'approved' | 'completed' | 'rejected';
  progress: number;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  approvalNotes?: string;
  lastModified?: string;
  modifiedBy?: string;
  modifiedByName?: string;
}

const InscriptionLogs: React.FC = () => {
  const [logs, setLogs] = useState<InscriptionLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<InscriptionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filterDate, logs]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const [inscriptionsData, turmasData, trilhasData, usersData] = await Promise.all([
        api.get('/turma-inscriptions'),
        api.get('/turmas'),
        api.get('/trilhas'),
        api.get('/users')
      ]);

      const enrichedLogs: InscriptionLog[] = inscriptionsData.data.map((insc: any) => {
        const turma = turmasData.data.find((t: any) => t.id === insc.turmaId);
        const trilha = trilhasData.data.find((tr: any) => tr.id === turma?.trilhaId);
        const user = usersData.data.find((u: any) => u.id === insc.userId);
        const approver = insc.approvedBy ? usersData.data.find((u: any) => u.id === insc.approvedBy) : null;
        const rejector = insc.rejectedBy ? usersData.data.find((u: any) => u.id === insc.rejectedBy) : null;

        return {
          ...insc,
          trilhaId: trilha?.id,
          trilhaTitle: trilha?.title || 'Trilha não encontrada',
          turmaName: turma?.name || 'Turma não encontrada',
          userName: user?.name || 'Usuário não encontrado',
          userEmail: user?.email || '',
          approvedByName: approver?.name || '',
          rejectedByName: rejector?.name || '',
          lastModified: insc.approvedAt || insc.rejectedAt || insc.inscriptionDate
        };
      });

      // Ordenar por data de modificação (mais recente primeiro)
      enrichedLogs.sort((a, b) => new Date(b.lastModified!).getTime() - new Date(a.lastModified!).getTime());

      setLogs(enrichedLogs);
      setFilteredLogs(enrichedLogs);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.trilhaTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.turmaName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.status === filterStatus);
    }

    // Filtro de data
    if (filterDate !== 'all') {
      const now = new Date();
      const dateLimit = new Date();
      
      switch (filterDate) {
        case 'today':
          dateLimit.setHours(0, 0, 0, 0);
          break;
        case 'week':
          dateLimit.setDate(now.getDate() - 7);
          break;
        case 'month':
          dateLimit.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(log => new Date(log.lastModified!) >= dateLimit);
    }

    setFilteredLogs(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className={styles.statusIconActive} />;
      case 'approved':
        return <FaCheckCircle className={styles.statusIconApproved} />;
      case 'completed':
        return <FaCheckCircle className={styles.statusIconCompleted} />;
      case 'pending':
        return <FaHourglassHalf className={styles.statusIconPending} />;
      case 'rejected':
        return <FaTimesCircle className={styles.statusIconRejected} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'approved': return 'Aprovado';
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const getProgressClass = (progress: number): string => {
    // Retorna a classe mais próxima baseada em intervalos de 10%
    const roundedProgress = Math.floor(progress / 10) * 10;
    switch (roundedProgress) {
      case 100: return styles.progress100;
      case 90: return styles.progress90;
      case 80: return styles.progress80;
      case 70: return styles.progress70;
      case 60: return styles.progress60;
      case 50: return styles.progress50;
      case 40: return styles.progress40;
      case 30: return styles.progress30;
      case 20: return styles.progress20;
      case 10: return styles.progress10;
      default: return styles.progress0;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando logs...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FaHistory className={styles.titleIcon} />
          <div>
            <h1>Logs de Inscrições</h1>
            <p>Histórico completo de todas as inscrições e suas modificações</p>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por aluno, e-mail, trilha ou turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.selectWrapper}>
          <FaFilter className={styles.selectIcon} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filtrar por status"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="active">Ativo</option>
            <option value="completed">Concluído</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <FaCalendar className={styles.selectIcon} />
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filtrar por período"
          >
            <option value="all">Todo o período</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <strong className={styles.statValue}>{filteredLogs.length}</strong>
          <span className={styles.statLabel}>inscrições encontradas</span>
        </div>
        <div className={styles.statCard}>
          <strong className={styles.statValue}>
            {filteredLogs.filter(l => l.status === 'active' || l.status === 'approved').length}
          </strong>
          <span className={styles.statLabel}>ativos</span>
        </div>
        <div className={styles.statCard}>
          <strong className={styles.statValue}>
            {filteredLogs.filter(l => l.status === 'pending').length}
          </strong>
          <span className={styles.statLabel}>pendentes</span>
        </div>
        <div className={styles.statCard}>
          <strong className={styles.statValue}>
            {filteredLogs.filter(l => l.status === 'completed').length}
          </strong>
          <span className={styles.statLabel}>concluídos</span>
        </div>
      </div>

      <div className={styles.logsContainer}>
        {filteredLogs.length === 0 ? (
          <div className={styles.emptyState}>
            <FaHistory />
            <p>Nenhum log encontrado com os filtros aplicados</p>
          </div>
        ) : (
          <div className={styles.logsList}>
            {filteredLogs.map((log) => (
              <div key={log.id} className={styles.logCard}>
                <div className={styles.logHeader}>
                  <div className={styles.logStatus}>
                    {getStatusIcon(log.status)}
                    <span className={styles.statusLabel}>{getStatusLabel(log.status)}</span>
                  </div>
                  <div className={styles.logDate}>
                    <FaClock className={styles.clockIcon} />
                    {formatDate(log.inscriptionDate)}
                  </div>
                </div>

                <div className={styles.logBody}>
                  <div className={styles.logInfo}>
                    <FaUser className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Aluno:</span>
                      <span className={styles.infoValue}>{log.userName}</span>
                      <span className={styles.infoEmail}>({log.userEmail})</span>
                    </div>
                  </div>

                  <div className={styles.logInfo}>
                    <FaBook className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Trilha:</span>
                      <span className={styles.infoValue}>{log.trilhaTitle}</span>
                      <span className={styles.infoSecondary}>• {log.turmaName}</span>
                    </div>
                  </div>

                  {log.progress > 0 && (
                    <div className={styles.progressSection}>
                      <span className={styles.progressLabel}>Progresso: {log.progress}%</span>
                      <div className={styles.progressBar}>
                        <div className={`${styles.progressFill} ${getProgressClass(log.progress)}`} />
                      </div>
                    </div>
                  )}
                </div>

                {(log.approvedAt || log.rejectedAt) && (
                  <div className={styles.logFooter}>
                    <FaEdit className={styles.footerIcon} />
                    <div className={styles.footerContent}>
                      {log.approvedAt && (
                        <div className={styles.footerItem}>
                          <span className={styles.footerLabel}>Aprovado em:</span>
                          <span className={styles.footerValue}>{formatDate(log.approvedAt)}</span>
                          {log.approvedByName && (
                            <span className={styles.footerBy}>por {log.approvedByName}</span>
                          )}
                        </div>
                      )}
                      {log.rejectedAt && (
                        <div className={styles.footerItem}>
                          <span className={styles.footerLabel}>Rejeitado em:</span>
                          <span className={styles.footerValue}>{formatDate(log.rejectedAt)}</span>
                          {log.rejectedByName && (
                            <span className={styles.footerBy}>por {log.rejectedByName}</span>
                          )}
                          {log.approvalNotes && (
                            <div className={styles.notes}>
                              <strong>Motivo:</strong> {log.approvalNotes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InscriptionLogs;
