import React from 'react';
import { TrilhaEmProgresso } from '../../types'; // Assuming this type exists
import styles from './InProgressTrailCard.module.css';

interface InProgressTrailCardProps {
  trail: TrilhaEmProgresso;
}

const InProgressTrailCard: React.FC<InProgressTrailCardProps> = ({ trail }) => {
  return (
    <div className={styles.card}>
      <h3>{trail.titulo}</h3>
      <p>Progresso: {trail.progresso}%</p>
    </div>
  );
};

export default InProgressTrailCard;
