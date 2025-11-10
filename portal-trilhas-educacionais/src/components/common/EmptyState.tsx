import React from 'react';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message = "Nenhum item encontrado." }) => {
  return (
    <div>
      <h2>Oops!</h2>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
