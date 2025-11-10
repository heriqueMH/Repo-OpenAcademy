import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireCoordinator?: boolean;
  requireAdminOrCoordinator?: boolean; // Nova opção
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireCoordinator = false,
  requireAdminOrCoordinator = false
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // Redireciona para a home se não estiver autenticado
    return <Navigate to="/" replace />;
  }

  // Se requer admin OU coordenador, verifica se é um dos dois
  if (requireAdminOrCoordinator && user?.role !== 'admin' && user?.role !== 'coordenador') {
    // Redireciona para o dashboard se não for admin nem coordenador
    return <Navigate to="/dashboard" replace />;
  }

  // Se requer admin, verifica se o usuário é admin
  if (requireAdmin && user?.role !== 'admin') {
    // Redireciona para o dashboard se não for admin
    return <Navigate to="/dashboard" replace />;
  }

  // Se requer coordenador, verifica se o usuário é coordenador
  if (requireCoordinator && user?.role !== 'coordenador') {
    // Redireciona para o dashboard se não for coordenador
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
