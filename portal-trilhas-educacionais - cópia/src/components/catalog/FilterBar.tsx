import React from 'react';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  // Placeholder for filter state and logic
  return (
    <div>
      <input type="text" placeholder="Buscar por nome..." />
      <select>
        <option value="">Todas as categorias</option>
      </select>
    </div>
  );
};

export default FilterBar;
