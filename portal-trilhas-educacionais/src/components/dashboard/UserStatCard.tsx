import React from 'react';

interface UserStatCardProps {
  label: string;
  value: number | string;
}

const UserStatCard: React.FC<UserStatCardProps> = ({ label, value }) => {
  return (
    <div>
      <h4>{label}</h4>
      <p>{value}</p>
    </div>
  );
};

export default UserStatCard;
