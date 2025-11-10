import React, { useState } from 'react';
import { useAuth, useEnrollmentFlow } from '../../hooks';
import { FaCheckCircle, FaLock } from 'react-icons/fa';
import styles from './EnrollButton.module.css';

interface EnrollButtonProps {
  trilhaId: string;
  trilhaTitle: string;
  disabled?: boolean;
  isEnrolled?: boolean; // Novo: indica se já está inscrito
  onEnrollSuccess?: () => void;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({ 
  trilhaId, 
  trilhaTitle, 
  disabled = false, 
  isEnrolled = false,
  onEnrollSuccess 
}) => {
  const { isAuthenticated, isVerified } = useAuth();
  
  const [localEnrolled, setLocalEnrolled] = useState(false);
  const { startEnrollment } = useEnrollmentFlow();

  const handleClick = () => {
    if (disabled) return;
    
    console.log('🎬 Iniciando fluxo de inscrição para:', trilhaTitle);
    
    startEnrollment({
      trilhaId,
      trilhaTitle,
      onSuccess: () => {
        console.log('✅ Callback onSuccess chamado!');
        setLocalEnrolled(true);
        if (onEnrollSuccess) {
          console.log('📞 Chamando onEnrollSuccess do pai...');
          onEnrollSuccess();
        }
      },
    });
  };

  // callbacks locais não são mais necessários; fluxo global cuida disso

  // Trilha já concluída
  if (disabled) {
    return (
      <button className={`${styles.enrollButton} ${styles.completed}`} disabled>
        <FaCheckCircle />
        <span>Concluída</span>
      </button>
    );
  }

  // Verifica se está inscrito (do servidor OU localmente)
  if (isEnrolled || localEnrolled) {
    return (
      <button className={`${styles.btn} ${styles.enrolled}`} disabled>
        <FaCheckCircle />
        Inscrito
      </button>
    );
  }

  return (
    <>
      {/* DEBUG (dev): loga transições de estágio para investigar aberturas inesperadas */}
      {process.env.NODE_ENV !== 'production' && null}
      <button
        className={styles.btn}
        onClick={handleClick}
      >
        {!isAuthenticated || !isVerified ? <FaLock /> : null}
        Inscrever-se
      </button>

      {/* Modais agora são controlados globalmente pelo EnrollmentFlowProvider */}
    </>
  );
};

export default EnrollButton;
