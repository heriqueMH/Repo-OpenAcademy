import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { Turma, Trilha, ModalidadeTurma } from '../../types';
import api from '../../services/api';
import styles from './TurmaFormModal.module.css';

interface TurmaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  turma?: Turma | null;
  trilha: Trilha;
}

interface Mentor {
  id: string;
  name: string;
}

const TurmaFormModal: React.FC<TurmaFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  turma,
  trilha
}) => {
  const [formData, setFormData] = useState({
    name: '',
    mentorId: '',
    modalidade: 'presencial' as ModalidadeTurma,
    location: '',
    horario: '',
    startDate: '',
    endDate: '',
    maxStudents: 30,
    status: 'planejada' as 'planejada' | 'inscricoes-abertas' | 'em-andamento' | 'concluida'
  });

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadMentors();
      
      if (turma) {
        // Edição: preencher com dados da turma
        setFormData({
          name: turma.name,
          mentorId: turma.mentorId || '',
          modalidade: turma.modalidade || 'presencial',
          location: turma.location || '',
          horario: turma.horario || '',
          startDate: turma.startDate.slice(0, 10), // Apenas data, sem hora
          endDate: turma.endDate.slice(0, 10),
          maxStudents: turma.maxStudents,
          status: turma.status
        });
      } else {
        // Criação: resetar form
        setFormData({
          name: '',
          mentorId: '',
          modalidade: 'presencial',
          location: '',
          horario: '',
          startDate: '',
          endDate: '',
          maxStudents: 30,
          status: 'planejada'
        });
      }
      setErrors({});
    }
  }, [isOpen, turma]);

  const loadMentors = async () => {
    try {
      const response = await api.get('/users?role=mentor');
      setMentors(response.data);
    } catch (error) {
      console.error('Erro ao carregar mentores:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da turma é obrigatório';
    }

    // Mentor é obrigatório apenas para modalidades que não sejam EAD assíncrono
    if (formData.modalidade !== 'ead-assincrono' && !formData.mentorId) {
      newErrors.mentorId = 'Selecione um mentor';
    }

    // Location é obrigatório apenas para presencial e híbrida
    if ((formData.modalidade === 'presencial' || formData.modalidade === 'hibrida') && !formData.location?.trim()) {
      newErrors.location = 'Localização é obrigatória para turmas presenciais e híbridas';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Data de término é obrigatória';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end <= start) {
        newErrors.endDate = 'Data de término deve ser posterior à data de início';
      }
    }

    if (formData.maxStudents < 1) {
      newErrors.maxStudents = 'Capacidade deve ser no mínimo 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const turmaData: any = {
        trilhaId: trilha.id,
        name: formData.name,
        modalidade: formData.modalidade,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        maxStudents: formData.maxStudents,
        status: formData.status,
        enrolledCount: turma?.enrolledCount || 0,
        createdAt: turma?.createdAt || new Date().toISOString()
      };

      // Adicionar mentorId apenas se não for EAD assíncrono
      if (formData.modalidade !== 'ead-assincrono' && formData.mentorId) {
        turmaData.mentorId = formData.mentorId;
      }

      // Adicionar location apenas para presencial e híbrida
      if ((formData.modalidade === 'presencial' || formData.modalidade === 'hibrida') && formData.location) {
        turmaData.location = formData.location;
      }

      // Adicionar horário se preenchido
      if (formData.horario?.trim()) {
        turmaData.horario = formData.horario;
      }

      if (turma) {
        // Editar turma existente
        await api.put(`/turmas/${turma.id}`, turmaData);
      } else {
        // Criar nova turma
        await api.post('/turmas', turmaData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      alert('Erro ao salvar turma. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxStudents' ? parseInt(value) || 0 : value
    }));
    
    // Limpar erro do campo quando usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{turma ? 'Editar Turma' : 'Nova Turma'}</h2>
          <button className={styles.closeBtn} onClick={onClose} title="Fechar">
            <FaTimes />
          </button>
        </div>

        <div className={styles.trilhaInfo}>
          <strong>Trilha:</strong> {trilha.title}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">
              Nome da Turma <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Turma Janeiro/2026"
              className={errors.name ? styles.inputError : ''}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="modalidade">
                Modalidade <span className={styles.required}>*</span>
              </label>
              <select
                id="modalidade"
                name="modalidade"
                value={formData.modalidade}
                onChange={handleChange}
              >
                <option value="presencial">Presencial</option>
                <option value="hibrida">Híbrida</option>
                <option value="ead-sincrono">EAD Síncrono</option>
                <option value="ead-assincrono">EAD Assíncrono</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status">
                Status <span className={styles.required}>*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="planejada">Planejada</option>
                <option value="inscricoes-abertas">Inscrições Abertas</option>
                <option value="em-andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>
          </div>

          {formData.modalidade !== 'ead-assincrono' && (
            <div className={styles.formGroup}>
              <label htmlFor="mentorId">
                Mentor <span className={styles.required}>*</span>
              </label>
              <select
                id="mentorId"
                name="mentorId"
                value={formData.mentorId}
                onChange={handleChange}
                className={errors.mentorId ? styles.inputError : ''}
              >
                <option value="">Selecione um mentor</option>
                {mentors.map(mentor => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name}
                  </option>
                ))}
              </select>
              {errors.mentorId && <span className={styles.errorText}>{errors.mentorId}</span>}
            </div>
          )}

          {(formData.modalidade === 'presencial' || formData.modalidade === 'hibrida') && (
            <div className={styles.formGroup}>
              <label htmlFor="location">
                Localização <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Sala 201 - Prédio A, Campus Higienópolis"
                className={errors.location ? styles.inputError : ''}
              />
              {errors.location && <span className={styles.errorText}>{errors.location}</span>}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="horario">
              Horário das Aulas {formData.modalidade !== 'ead-assincrono' && <span className={styles.recommended}>(recomendado)</span>}
            </label>
            <input
              type="text"
              id="horario"
              name="horario"
              value={formData.horario}
              onChange={handleChange}
              placeholder="Ex: Terças e Quintas, 19h às 22h"
              className={errors.horario ? styles.inputError : ''}
            />
            {errors.horario && <span className={styles.errorText}>{errors.horario}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">
                Data de Início <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? styles.inputError : ''}
              />
              {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate">
                Data de Término <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? styles.inputError : ''}
              />
              {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxStudents">
              Capacidade Máxima <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="maxStudents"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleChange}
              min="1"
              max="100"
              className={errors.maxStudents ? styles.inputError : ''}
            />
            {errors.maxStudents && <span className={styles.errorText}>{errors.maxStudents}</span>}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSave}
              disabled={loading}
            >
              <FaSave /> {loading ? 'Salvando...' : turma ? 'Salvar Alterações' : 'Criar Turma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TurmaFormModal;
