import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Placeholder for pagination logic
  return (
    <div>
      <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
        Anterior
      </button>
      <span>Página {currentPage} de {totalPages}</span>
      <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Próxima
      </button>
    </div>
  );
};

export default Pagination;
