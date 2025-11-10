import React, { useEffect, useState, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Trilha } from '../../types';
import { TurmaCard } from '../catalog';
import { useTurmas } from '../../hooks/useTurmas';
import { useEnrollmentFlow } from '../../hooks';
import styles from './TurmaSelectionModal.module.css';

interface TurmaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trilha: Trilha;
  onEnrollSuccess?: () => void;
}

const TurmaSelectionModal: React.FC<TurmaSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  trilha,
  onEnrollSuccess 
}) => {
  const { 
    turmas, 
    loading, 
    isEnrolledInTurma,
    loadTurmas,
    loadUserInscriptions
  } = useTurmas(trilha.id);
  
  const { startEnrollment } = useEnrollmentFlow();

  const [success, setSuccess] = useState('');
  const loadedTrilhaIdRef = useRef<string | null>(null);

  useEffect(() => {
    // GUARDA: só carrega se o modal estiver aberto E for uma nova trilha
    if (isOpen && trilha.id && loadedTrilhaIdRef.current !== trilha.id) {
      console.log('📂 TurmaSelectionModal: Carregando turmas para', trilha.title);
      loadTurmas(trilha.id, true);
      loadUserInscriptions();
      setSuccess('');
      loadedTrilhaIdRef.current = trilha.id;
    }
    
    // Reseta quando o modal fecha
    if (!isOpen) {
      loadedTrilhaIdRef.current = null;
      setSuccess('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const onEnroll = (turmaId: string) => {
    // Usa o fluxo centralizado de inscrição
    // Se o usuário não estiver logado, o modal de cadastro será aberto automaticamente
    startEnrollment({
      trilhaId: trilha.id,
      trilhaTitle: trilha.title,
      onSuccess: () => {
        setSuccess('Inscrição realizada com sucesso!');
        setTimeout(() => {
          if (onEnrollSuccess) {
            onEnrollSuccess();
          }
          onClose();
        }, 1500);
      },
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>Selecione uma Turma</h2>
            <p className={styles.trilhaName}>{trilha.title}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar modal">
            <FaTimes />
          </button>
        </div>

        <div className={styles.content}>
          {success && <div className={styles.success}>{success}</div>}

          {loading ? (
            <div className={styles.loading}>Carregando turmas disponíveis...</div>
          ) : turmas.length === 0 ? (
            <div className={styles.empty}>
              <p>😕 Não há turmas com inscrições abertas no momento.</p>
              <p className={styles.emptySubtext}>
                Novas turmas são abertas mensalmente. Volte em breve!
              </p>
            </div>
          ) : (
            <div className={styles.turmasList}>
              {turmas.map((turma) => (
                <TurmaCard
                  key={turma.id}
                  turma={turma}
                  onEnroll={onEnroll}
                  isEnrolled={isEnrolledInTurma(turma.id)}
                  loading={false}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p className={styles.info}>
            💡 Você pode se inscrever em múltiplas turmas ao longo do tempo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TurmaSelectionModal;
