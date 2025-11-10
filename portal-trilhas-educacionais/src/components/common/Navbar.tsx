import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { getUserById } from '../../services/api';
import { FaTachometerAlt, FaCog, FaSignOutAlt, FaExclamationTriangle, FaUserShield } from 'react-icons/fa';
import styles from './Navbar.module.css';
import { LoginModal } from '../modals';

const Navbar: React.FC = () => {
  const { user, isVerified, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');

  // Buscar dados frescos do usuário
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        const data = await getUserById(user.id);
        setUserData(data);
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
      }
    };

    loadUserData();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleOpenModal = (mode: 'login' | 'register') => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <LoginModal
        key={`login-${isModalOpen ? modalMode : 'closed'}`}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
      />

      <nav className={styles.navbar}>
        <div className={styles.container}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <img src="/logo-full.png" alt="Open Academy | Mackenzie" className={styles.logoImg} />
          </Link>

          {/* Links de Navegação - apenas para alunos e visitantes */}
          {(!user || user.role === 'aluno' || user.role === 'visitante') && (
            <div className={styles.navLinks}>
              <Link to="/catalog" className={styles.navLink}>
                Turmas
              </Link>
            </div>
          )}

          {/* Área de Autenticação */}
          <div className={styles.authSection}>
            {!isAuthenticated ? (
              <>
                <button onClick={() => handleOpenModal('login')} className={styles.btnSecondary}>
                  Entrar
                </button>
                <button onClick={() => handleOpenModal('register')} className={styles.btnPrimary}>
                  Cadastrar
                </button>
              </>
            ) : (
              <div className={styles.userMenu}>
                {/* Alerta de verificação */}
                {!isVerified && (
                  <div className={styles.verificationAlert}>
                    <FaExclamationTriangle />
                    <span>Conta não verificada</span>
                  </div>
                )}

                {/* Avatar e Menu */}
                <button
                  className={styles.userButton}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {userData?.avatar ? (
                    <img src={userData.avatar} alt={userData.name} className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {userData?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <span className={styles.userName}>Olá, {userData?.name || 'Usuário'}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className={styles.dropdown}>
                    {/* Menu específico por role */}
                    {user?.role === 'admin' && (
                      <>
                        <Link
                          to="/admin"
                          className={`${styles.dropdownItem} ${styles.adminItem}`}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUserShield />
                          Painel Admin
                        </Link>
                        <Link
                          to="/profile"
                          className={styles.dropdownItem}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaCog />
                          Meu Perfil
                        </Link>
                        <hr className={styles.divider} />
                        <button className={styles.dropdownItem} onClick={handleLogout}>
                          <FaSignOutAlt />
                          Sair
                        </button>
                      </>
                    )}

                    {user?.role === 'coordenador' && (
                      <>
                        <Link
                          to="/coordenador/trilhas"
                          className={`${styles.dropdownItem} ${styles.adminItem}`}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUserShield />
                          Gerenciar Turmas
                        </Link>
                        <Link
                          to="/admin/trilhas"
                          className={`${styles.dropdownItem} ${styles.adminItem}`}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUserShield />
                          Editar Trilhas
                        </Link>
                        <Link
                          to="/coordenador/aprovacoes"
                          className={`${styles.dropdownItem} ${styles.adminItem}`}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUserShield />
                          Aprovar Inscrições
                        </Link>
                        <Link
                          to="/profile"
                          className={styles.dropdownItem}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaCog />
                          Meu Perfil
                        </Link>
                        <hr className={styles.divider} />
                        <button className={styles.dropdownItem} onClick={handleLogout}>
                          <FaSignOutAlt />
                          Sair
                        </button>
                      </>
                    )}

                    {user?.role === 'mentor' && (
                      <>
                        {/* TODO: Adicionar funcionalidades específicas do mentor */}
                        <Link
                          to="/profile"
                          className={styles.dropdownItem}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaCog />
                          Meu Perfil
                        </Link>
                        <hr className={styles.divider} />
                        <button className={styles.dropdownItem} onClick={handleLogout}>
                          <FaSignOutAlt />
                          Sair
                        </button>
                      </>
                    )}

                    {(user?.role === 'aluno' || user?.role === 'visitante') && (
                      <>
                        <Link
                          to="/dashboard"
                          className={styles.dropdownItem}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaTachometerAlt />
                          Meu Aprendizado
                        </Link>
                        <Link
                          to="/my-inscriptions"
                          className={styles.dropdownItem}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaCog />
                          Minhas Inscrições
                        </Link>
                        <Link
                          to="/profile"
                          className={styles.dropdownItem}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaCog />
                          Meu Perfil
                        </Link>
                        <hr className={styles.divider} />
                        <button className={styles.dropdownItem} onClick={handleLogout}>
                          <FaSignOutAlt />
                          Sair
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
