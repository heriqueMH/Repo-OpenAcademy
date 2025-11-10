import React from 'react';
import { Trilha } from '../../types';

interface TrailFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trail: Partial<Trilha>) => void;
  trail: Partial<Trilha> | null;
}

const TrailFormModal: React.FC<TrailFormModalProps> = ({ isOpen, onClose, onSave, trail }) => {
  if (!isOpen) return null;

  // Placeholder for form state and logic
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // onSave(formData);
  };

  return (
    <div className="modalOverlay">
      <div className="modal">
        <h2>{trail?.id ? 'Editar Trilha' : 'Adicionar Trilha'}</h2>
        <form onSubmit={handleSubmit}>
          {/* Form fields for trail */}
          <div className="modalActions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrailFormModal;
