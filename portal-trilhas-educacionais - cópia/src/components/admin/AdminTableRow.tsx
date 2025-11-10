import React from 'react';

interface AdminTableRowProps {
  item: any; // Replace with specific type for User or Trail
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

const AdminTableRow: React.FC<AdminTableRowProps> = ({ item, onEdit, onDelete }) => {
  // This is a placeholder. The actual cells will depend on the data structure.
  return (
    <tr>
      <td>{item.id}</td>
      <td>{item.name || item.title}</td>
      <td>
        <button onClick={() => onEdit(item)}>Editar</button>
        <button onClick={() => onDelete(item)}>Excluir</button>
      </td>
    </tr>
  );
};

export default AdminTableRow;
