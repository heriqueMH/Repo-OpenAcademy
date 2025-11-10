import React from 'react';
import { Trilha } from '../../types';
import { FaClock, FaUser, FaStar, FaUsers, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  trilha: Trilha;
  userStatus?: {
    status: 'pending' | 'approved' | 'active' | 'completed';
    progress: number;
  } | null;
  onOpenTurmaModal?: () => void;
  onEnrollSuccess?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ trilha, userStatus, onOpenTurmaModal, onEnrollSuccess }) => {
  // Estados do card
  const isPending = userStatus?.status === 'pending'; // Aguardando aprovação
  const isApproved = userStatus?.status === 'approved'; // Aprovado, mas turma ainda não iniciou
  const isActive = userStatus?.status === 'active'; // Inscrito e cursando
  const isCompleted = userStatus?.status === 'completed' || !!(userStatus?.progress && userStatus.progress >= 100);

  console.log(`🎯 CourseCard ${trilha.title}:`, { userStatus, isPending, isApproved, isActive, isCompleted });

  return (
    <div className={`${styles.card} ${isCompleted ? styles.completed : ''}`}>
      {/* Checkmark gigante no centro para trilhas concluídas */}
      {isCompleted && (
        <div className={styles.completedCheckmark}>
          <FaCheckCircle />
        </div>
      )}

      {/* Thumbnail */}
      {trilha.thumbnail && (
        <div className={styles.thumbnail}>
          <img src={trilha.thumbnail} alt={trilha.title} />
          <span className={`${styles.levelBadge} ${styles[trilha.level]}`}>
            {trilha.level}
          </span>

          {/* Badge de Em Progresso */}
          {isActive && (
            <div className={styles.progressBadge}>
              {userStatus.progress}% concluído
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.category}>{trilha.category}</div>
        
        <h3 className={styles.title}>{trilha.title}</h3>
        
        <p className={styles.description}>{trilha.description}</p>

        {/* Meta Info */}
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <FaUser />
            <span>{trilha.mentor?.name || 'Mentor não definido'}</span>
          </div>
          <div className={styles.metaItem}>
            <FaClock />
            <span>{trilha.duration}h</span>
          </div>
          <div className={styles.metaItem}>
            <FaUsers />
            <span>{trilha.enrolledCount} alunos</span>
          </div>
          {trilha.rating && (
            <div className={styles.metaItem}>
              <FaStar />
              <span>{trilha.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Botão de Inscrição - 4 Estados */}
        <div className={styles.actions}>
          {isCompleted ? (
            // Estado 4: Concluído - bloqueado e verde
            <button className={styles.completedButton} disabled>
              <FaCheckCircle /> Concluída
            </button>
          ) : isActive ? (
            // Estado 3: Inscrito - cursando (pode mostrar progresso)
            <button className={styles.activeButton} disabled>
              Inscrito {userStatus.progress > 0 && `• ${userStatus.progress}%`}
            </button>
          ) : isApproved ? (
            // Estado 2: Aprovado - aguardando início da turma
            <button className={styles.approvedButton} disabled>
              Aprovado • Aguardando Início
            </button>
          ) : isPending ? (
            // Estado 1b: Aguardando Aprovação - após inscrição
            <button className={styles.pendingButton} disabled>
              <FaHourglassHalf /> Aguardando Aprovação
            </button>
          ) : (
            // Estado 1a: Ver Turmas Disponíveis - padrão
            <button 
              className={styles.enrollButton}
              onClick={onOpenTurmaModal}
            >
              Ver Turmas Disponíveis
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
