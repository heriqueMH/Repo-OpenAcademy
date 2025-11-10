import React, { useState } from 'react';
import { FaTimes, FaUser, FaPhone, FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import styles from './ComplementaryDataModal.module.css';

interface ComplementaryDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: ComplementaryData) => void;
  userName?: string;
  userEmail?: string;
}

export interface ComplementaryData {
  phone: string;
  occupation: string;
  educationLevel: string;
  interests: string;
}

const ComplementaryDataModal: React.FC<ComplementaryDataModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  userName,
  userEmail
}) => {
  const [formData, setFormData] = useState<ComplementaryData>({
    phone: '',
    occupation: '',
    educationLevel: '',
    interests: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações básicas
    if (!formData.phone || !formData.occupation || !formData.educationLevel) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      // Simula salvamento (aqui você faria a chamada à API)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSuccess(formData);
      
      // Limpa o formulário
      setFormData({
        phone: '',
        occupation: '',
        educationLevel: '',
        interests: '',
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <FaUser />
          </div>
          <h2>Complete seu Cadastro</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar modal">
            <FaTimes />
          </button>
        </div>

        {/* Info do usuário */}
        <div className={styles.userInfo}>
          <p><strong>Nome:</strong> {userName}</p>
          <p><strong>Email:</strong> {userEmail}</p>
        </div>

        <p className={styles.subtitle}>
          Para continuar, precisamos de algumas informações adicionais
        </p>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Telefone */}
          <div className={styles.inputGroup}>
            <label htmlFor="phone">
              <FaPhone className={styles.labelIcon} />
              Telefone *
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          {/* Ocupação */}
          <div className={styles.inputGroup}>
            <label htmlFor="occupation">
              <FaBriefcase className={styles.labelIcon} />
              Ocupação *
            </label>
            <input
              id="occupation"
              type="text"
              placeholder="Ex: Desenvolvedor, Estudante, Designer..."
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              required
            />
          </div>

          {/* Nível de Escolaridade */}
          <div className={styles.inputGroup}>
            <label htmlFor="educationLevel">
              <FaGraduationCap className={styles.labelIcon} />
              Nível de Escolaridade *
            </label>
            <select
              id="educationLevel"
              value={formData.educationLevel}
              onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
              required
            >
              <option value="">Selecione...</option>
              <option value="Ensino Fundamental">Ensino Fundamental</option>
              <option value="Ensino Médio">Ensino Médio</option>
              <option value="Ensino Superior (Cursando)">Ensino Superior (Cursando)</option>
              <option value="Ensino Superior (Completo)">Ensino Superior (Completo)</option>
              <option value="Pós-graduação">Pós-graduação</option>
              <option value="Mestrado">Mestrado</option>
              <option value="Doutorado">Doutorado</option>
            </select>
          </div>

          {/* Áreas de Interesse */}
          <div className={styles.inputGroup}>
            <label htmlFor="interests">
              Áreas de Interesse
            </label>
            <textarea
              id="interests"
              placeholder="Descreva suas áreas de interesse (opcional)"
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              rows={3}
            />
          </div>

          {/* Mensagens */}
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* Botões */}
          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplementaryDataModal;
