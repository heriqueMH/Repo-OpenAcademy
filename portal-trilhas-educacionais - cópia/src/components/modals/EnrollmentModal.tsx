import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Trilha } from '../../types';
import { FaCheckCircle, FaClock, FaUser, FaStar, FaUsers, FaGraduationCap } from 'react-icons/fa';
import { createInscription, checkInscription, updateInscription, getTrilhaById, getUserById } from '../../services/api';
import styles from './EnrollmentModal.module.css';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  trilhaId: string;
  trilhaTitle: string;
  onSuccess?: () => void;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ 
  isOpen, 
  onClose, 
  trilhaId, 
  trilhaTitle,
  onSuccess 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [loadingTrilha, setLoadingTrilha] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Carregar dados completos da trilha
  useEffect(() => {
    const loadTrilha = async () => {
      if (isOpen && trilhaId) {
        setLoadingTrilha(true);
        try {
          const trilhaData = await getTrilhaById(trilhaId);
          setTrilha(trilhaData);
        } catch (error) {
          console.error('Erro ao carregar trilha:', error);
        } finally {
          setLoadingTrilha(false);
        }
      }
    };

    loadTrilha();
  }, [isOpen, trilhaId]);

  // Carregar dados completos do usuário do banco (igual ao ProfilePage)
  useEffect(() => {
    const loadUserData = async () => {
      if (isOpen && user?.id) {
        setLoadingUser(true);
        try {
          const data = await getUserById(user.id);
          setUserData(data);
          console.log('✅ Dados do usuário carregados do banco:', data);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        } finally {
          setLoadingUser(false);
        }
      }
    };

    loadUserData();
  }, [isOpen, user]);

  // Bloquear scroll do body e fechar com ESC
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verificar se já existe inscrição
      const existingInscription = await checkInscription(user?.id || '', trilhaId);
      
      if (existingInscription) {
        // Atualizar inscrição existente
        await updateInscription(existingInscription.id, {
          status: 'active',
        });
      } else {
        // Criar nova inscrição (sem enrollmentData - dados vêm da tabela users)
        await createInscription({
          userId: user?.id,
          trilhaId,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao criar inscrição:', err);
      setError('Erro ao processar inscrição. Tente novamente.');
      setLoading(false);
    }
  };

  const modalRoot = useMemo(() => {
    if (typeof document === 'undefined') return undefined;
    return document.getElementById('modal-root') || undefined;
  }, []);

  if (!isOpen) return null;

  const content = success ? (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enrollment-success-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <FaCheckCircle />
          </div>
          <h2 id="enrollment-success-title">Inscrição Realizada!</h2>
          <p>Você foi inscrito com sucesso na trilha <strong>{trilhaTitle}</strong>.</p>
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="enrollment-modal-title">Confirmar Inscrição</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">×</button>
        </div>

        {/* Informações Detalhadas da Trilha */}
        {loadingTrilha ? (
          <div className={styles.trilhaInfo}>
            <p>Carregando informações da trilha...</p>
          </div>
        ) : trilha ? (
          <div className={styles.trilhaDetails}>
            <div className={styles.trilhaHeader}>
              {trilha.thumbnail && (
                <img 
                  src={trilha.thumbnail} 
                  alt={trilha.title} 
                  className={styles.trilhaThumbnail}
                />
              )}
              <div className={styles.trilhaMainInfo}>
                <h3>{trilha.title}</h3>
                <span className={`${styles.levelBadge} ${styles[trilha.level]}`}>
                  {trilha.level}
                </span>
              </div>
            </div>

            <p className={styles.trilhaDescription}>{trilha.description}</p>

            <div className={styles.trilhaMeta}>
              <div className={styles.metaItem}>
                <FaUser className={styles.metaIcon} />
                <span><strong>Mentor:</strong> {trilha.mentor?.name || 'Não informado'}</span>
              </div>
              <div className={styles.metaItem}>
                <FaClock className={styles.metaIcon} />
                <span><strong>Duração:</strong> {trilha.duration} horas</span>
              </div>
              <div className={styles.metaItem}>
                <FaUsers className={styles.metaIcon} />
                <span><strong>Alunos:</strong> {trilha.enrolledCount}</span>
              </div>
              {trilha.rating && (
                <div className={styles.metaItem}>
                  <FaStar className={styles.metaIcon} />
                  <span><strong>Avaliação:</strong> {trilha.rating.toFixed(1)}/5.0</span>
                </div>
              )}
            </div>

            <div className={styles.categoryBadge}>
              <FaGraduationCap className={styles.categoryIcon} />
              {trilha.category}
            </div>
          </div>
        ) : (
          <div className={styles.trilhaInfo}>
            <p><strong>Trilha:</strong> {trilhaTitle}</p>
          </div>
        )}

        <div className={styles.divider}></div>

        <div className={styles.userInfo}>
          <h3>Seus Dados</h3>
          {loadingUser ? (
            <p className={styles.loadingText}>Carregando dados...</p>
          ) : (
            <div className={styles.userDataGrid}>
              <p><strong>Nome:</strong> {userData?.name || user?.name}</p>
              <p><strong>Email:</strong> {userData?.email || user?.email}</p>
              <p><strong>CPF:</strong> {userData?.cpf || 'Não informado'}</p>
              <p><strong>Cidade:</strong> {userData?.address?.city || 'Não informado'} - {userData?.address?.state || ''}</p>
            </div>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Inscrevendo...' : 'Confirmar Inscrição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return modalRoot ? createPortal(content, modalRoot) : content;
};

export default EnrollmentModal;
