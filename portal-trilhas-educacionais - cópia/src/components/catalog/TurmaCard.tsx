import React from 'react';
import { Turma } from '../../types';
import styles from './TurmaCard.module.css';

interface TurmaCardProps {
  turma: Turma;
  onEnroll: (turmaId: string) => void;
  isEnrolled?: boolean;
  loading?: boolean;
}

const TurmaCard: React.FC<TurmaCardProps> = ({ turma, onEnroll, isEnrolled, loading }) => {
  const vagasRestantes = turma.maxStudents - turma.enrolledCount;
  const percentualOcupacao = Math.round((turma.enrolledCount / turma.maxStudents) * 100);
  
  const getStatusBadge = () => {
    switch (turma.status) {
      case 'inscricoes-abertas':
        return <span className={`${styles.badge} ${styles.badgeOpen}`}>Inscrições Abertas</span>;
      case 'em-andamento':
        return <span className={`${styles.badge} ${styles.badgeOngoing}`}>Em Andamento</span>;
      case 'planejada':
        return <span className={`${styles.badge} ${styles.badgePlanned}`}>Planejada</span>;
      case 'concluida':
        return <span className={`${styles.badge} ${styles.badgeCompleted}`}>Concluída</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isLotada = vagasRestantes === 0;
  const canEnroll = turma.status === 'inscricoes-abertas' && !isLotada && !isEnrolled;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{turma.name}</h3>
        {getStatusBadge()}
      </div>

      <div className={styles.info}>
        <div className={styles.dates}>
          <div className={styles.dateItem}>
            <span className={styles.label}>Início:</span>
            <span className={styles.value}>{formatDate(turma.startDate)}</span>
          </div>
          <div className={styles.dateItem}>
            <span className={styles.label}>Término:</span>
            <span className={styles.value}>{formatDate(turma.endDate)}</span>
          </div>
        </div>

        <div className={styles.vagas}>
          <div className={styles.vagasHeader}>
            <span className={styles.label}>Vagas:</span>
            <span className={`${styles.value} ${isLotada ? styles.lotada : ''}`}>
              {vagasRestantes} de {turma.maxStudents} disponíveis
            </span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={`${styles.progressFill} ${styles[`progress${percentualOcupacao}`] || ''}`}
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        {isEnrolled ? (
          <button className={styles.enrolledBtn} disabled>
            ✓ Inscrito
          </button>
        ) : isLotada ? (
          <button className={styles.lotadaBtn} disabled>
            Turma Lotada
          </button>
        ) : canEnroll ? (
          <button 
            className={styles.enrollBtn} 
            onClick={() => onEnroll(turma.id)}
            disabled={loading}
          >
            {loading ? 'Inscrevendo...' : 'Inscrever-se'}
          </button>
        ) : (
          <button className={styles.unavailableBtn} disabled>
            Indisponível
          </button>
        )}
      </div>
    </div>
  );
};

export default TurmaCard;
