import React from 'react';

interface AdminToolbarProps {
  onSearch: (query: string) => void;
  onAddNew: () => void;
  searchTerm: string;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({ onSearch, onAddNew, searchTerm }) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
      <button onClick={onAddNew}>Adicionar Novo</button>
    </div>
  );
};

export default AdminToolbar;
