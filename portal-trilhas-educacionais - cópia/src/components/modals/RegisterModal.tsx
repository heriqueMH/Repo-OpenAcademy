import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Modal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { registerWithEmail } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await registerWithEmail(name, email, password);
      setSuccess('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.');
      // Limpar campos após sucesso
      setName('');
      setEmail('');
      setPassword('');
      // Fechar modal após um tempo
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Falha no cadastro. Tente novamente.');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Cadastro</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
          <button type="submit">Cadastrar</button>
        </form>
        <p className={styles.switchText}>
          Já tem uma conta?{' '}
          <span onClick={onSwitchToLogin} className={styles.switchLink}>
            Faça login
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
