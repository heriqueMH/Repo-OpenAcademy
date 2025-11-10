import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, DataProvider, EnrollmentFlowProvider } from './contexts';
import { Navbar, Footer, ProtectedRoute } from './components/common';
import { 
  Home, 
  CatalogPage, 
  Dashboard, 
  ProfilePage, 
  MyInscriptionsPage, 
  VerifyEmailPage,
  AdminDashboard,
  AdminTrilhas,
  AdminUsuarios,
  CoordinatorTrilhas,
  PendingEnrollments,
  InscriptionLogs
} from './pages';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <EnrollmentFlowProvider>
        <DataProvider>
          <Router>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                {/* Rotas Públicas */}
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/verificar-email" element={<VerifyEmailPage />} />

                {/* Rotas Protegidas */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-inscriptions"
                    element={
                      <ProtectedRoute>
                        <MyInscriptionsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rotas Admin */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/trilhas"
                    element={
                      <ProtectedRoute requireAdminOrCoordinator>
                        <AdminTrilhas />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/usuarios"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminUsuarios />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rotas Coordenador */}
                  <Route
                    path="/coordenador/trilhas"
                    element={
                      <ProtectedRoute requireCoordinator>
                        <CoordinatorTrilhas />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/coordenador/aprovacoes"
                    element={
                      <ProtectedRoute requireCoordinator>
                        <PendingEnrollments />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rota de Logs de Inscrições (Admin e Coordenador) */}
                  <Route
                    path="/admin/inscricoes"
                    element={
                      <ProtectedRoute requireAdminOrCoordinator>
                        <InscriptionLogs />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </DataProvider>
      </EnrollmentFlowProvider>
    </AuthProvider>
  );
};

export default App;