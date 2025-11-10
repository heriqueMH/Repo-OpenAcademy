import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaTimes, FaExclamationTriangle, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import styles from './VerificationModal.module.css';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { verifyEmail, resendVerificationCode } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await verifyEmail(code);
      setSuccess(true);
      
      // Aguarda 1.5s para mostrar sucesso e depois chama callback
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        setSuccess(false);
        setCode('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess(false);
    
    try {
      await resendVerificationCode();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar código.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {!success ? (
          <>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.iconWarning}>
                <FaExclamationTriangle />
              </div>
              <h2>Verificação de Email</h2>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar modal">
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
              <p className={styles.message}>
                Enviamos um <strong>código de 6 dígitos</strong> para o seu email.
              </p>
              <p className={styles.submessage}>
                Digite o código abaixo para verificar sua conta:
              </p>

              {/* Dica de Desenvolvimento */}
              <div className={styles.devHint}>
                💡 <strong>Desenvolvimento:</strong> Verifique o console do navegador (F12) para ver o código de verificação.
              </div>

              {/* Form */}
              <form onSubmit={handleVerify} className={styles.verifyForm}>
                <div className={styles.inputGroup}>
                  <FaEnvelope className={styles.icon} />
                  <input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    className={styles.codeInput}
                  />
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {resendSuccess && <div className={styles.success}>✓ Código reenviado!</div>}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading || code.length !== 6}
                >
                  {loading ? 'Verificando...' : 'Verificar Email'}
                </button>
              </form>

              <button
                className={styles.resendBtn}
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </div>

            {/* Info */}
            <div className={styles.infoBox}>
              <p>
                🔒 <strong>Seguro:</strong> Esta é uma medida de segurança para garantir que
                apenas usuários verificados tenham acesso completo à plataforma.
              </p>
            </div>
          </>
        ) : (
          /* Success State */
          <div className={styles.successState}>
            <div className={styles.iconSuccess}>
              <FaCheckCircle />
            </div>
            <h2>Email Verificado!</h2>
            <p>Você já pode acessar todas as funcionalidades da plataforma.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;
