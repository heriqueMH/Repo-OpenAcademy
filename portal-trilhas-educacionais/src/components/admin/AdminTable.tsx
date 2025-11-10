import React from 'react';

interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
}

const AdminTable: React.FC<AdminTableProps> = ({ headers, children }) => {
  return (
    <table>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  );
};

export default AdminTable;
