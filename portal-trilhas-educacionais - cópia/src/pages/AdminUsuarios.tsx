import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaUserShield, FaUserGraduate, FaEye, FaCheckCircle, FaTimesCircle, FaFilter } from 'react-icons/fa';
import { getAllUsers, deleteUser, updateUserRole } from '../services/api';
import { User } from '../types';
import styles from './AdminUsuarios.module.css';

const AdminUsuarios: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const filterUsers = () => {
    let filtered = [...users];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.cpf && user.cpf.includes(searchTerm))
      );
    }

    // Filtro de role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Filtro de verificação
    if (filterVerified !== 'all') {
      const isVerified = filterVerified === 'verified';
      filtered = filtered.filter(user => user.isVerified === isVerified);
    }

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterRole, filterVerified, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${name}"?`)) {
      return;
    }

    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      setSuccess('Usuário excluído com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      setError('Erro ao excluir usuário.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleChangeRole = async (newRole: string) => {
    if (!selectedUser) return;

    try {
      await updateUserRole(selectedUser.id, newRole);
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, role: newRole as User['role'] } : u
      ));
      setSuccess(`Role alterado para ${newRole} com sucesso!`);
      setShowRoleModal(false);
      setSelectedUser(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao alterar role:', err);
      setError('Erro ao alterar role do usuário.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: { label: string; class: string } } = {
      admin: { label: 'Admin', class: styles.roleAdmin },
      coordenador: { label: 'Coordenador', class: styles.roleCoordenador },
      mentor: { label: 'Mentor', class: styles.roleMentor },
      aluno: { label: 'Aluno', class: styles.roleAluno },
      visitante: { label: 'Visitante', class: styles.roleVisitante },
    };

    const badge = badges[role] || badges.visitante;
    return <span className={`${styles.roleBadge} ${badge.class}`}>{badge.label}</span>;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Gerenciar Usuários</h1>
          <p>Administre os usuários cadastrados no portal</p>
        </div>
      </div>

      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.selectWrapper}>
          <FaUserShield className={styles.selectIcon} />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={styles.select}
            aria-label="Filtrar por role"
          >
            <option value="all">Todas as funções</option>
            <option value="admin">Admin</option>
            <option value="coordenador">Coordenador</option>
            <option value="mentor">Mentor</option>
            <option value="aluno">Aluno</option>
            <option value="visitante">Visitante</option>
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <FaFilter className={styles.selectIcon} />
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className={styles.select}
            aria-label="Filtrar por verificação"
          >
            <option value="all">Todos os status</option>
            <option value="verified">Verificados</option>
            <option value="unverified">Não verificados</option>
          </select>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <strong>{filteredUsers.length}</strong>
          <span>usuários encontrados</span>
        </div>
        <div className={styles.statItem}>
          <strong>{users.filter(u => u.isVerified).length}</strong>
          <span>verificados</span>
        </div>
        <div className={styles.statItem}>
          <strong>{users.filter(u => u.role === 'aluno').length}</strong>
          <span>alunos</span>
        </div>
      </div>

      <div className={styles.usersList}>
        {filteredUsers.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.col1}>Usuário</div>
              <div className={styles.col2}>Email</div>
              <div className={styles.col3}>CPF</div>
              <div className={styles.col4}>Role</div>
              <div className={styles.col5}>Verificado</div>
              <div className={styles.col6}>Mackenzie</div>
              <div className={styles.col7}>Ações</div>
            </div>

            {filteredUsers.map(user => (
              <div key={user.id} className={styles.tableRow}>
                <div className={styles.col1}>
                  <div className={styles.userInfo}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3>{user.name}</h3>
                      <p>ID: {user.id}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.col2}>{user.email}</div>
                <div className={styles.col3}>{user.cpf || '-'}</div>
                <div className={styles.col4}>{getRoleBadge(user.role)}</div>
                <div className={styles.col5}>
                  {user.isVerified ? (
                    <span className={styles.verified}>
                      <FaCheckCircle /> Sim
                    </span>
                  ) : (
                    <span className={styles.unverified}>
                      <FaTimesCircle /> Não
                    </span>
                  )}
                </div>
                <div className={styles.col6}>
                  {user.isMackenzieStudent ? (
                    <span className={styles.mackenzie}>Sim</span>
                  ) : (
                    <span className={styles.notMackenzie}>Não</span>
                  )}
                </div>
                <div className={styles.col7}>
                  <div className={styles.actions}>
                    <button
                      className={styles.viewBtn}
                      title="Ver detalhes"
                      onClick={() => alert(`Ver detalhes de ${user.name}`)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className={styles.editBtn}
                      title="Alterar role"
                      onClick={() => handleOpenRoleModal(user)}
                    >
                      <FaUserShield />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(user.id, user.name)}
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de alteração de role */}
      {showRoleModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setShowRoleModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Alterar Role do Usuário</h2>
            <p className={styles.modalUserInfo}>
              <strong>{selectedUser.name}</strong> - {selectedUser.email}
            </p>
            <p className={styles.currentRole}>
              Role atual: {getRoleBadge(selectedUser.role)}
            </p>

            <div className={styles.roleOptions}>
              <button
                className={`${styles.roleOption} ${styles.roleAdmin}`}
                onClick={() => handleChangeRole('admin')}
                disabled={selectedUser.role === 'admin'}
              >
                <FaUserShield />
                Admin
              </button>
              <button
                className={`${styles.roleOption} ${styles.roleCoordenador}`}
                onClick={() => handleChangeRole('coordenador')}
                disabled={selectedUser.role === 'coordenador'}
              >
                <FaUserGraduate />
                Coordenador
              </button>
              <button
                className={`${styles.roleOption} ${styles.roleMentor}`}
                onClick={() => handleChangeRole('mentor')}
                disabled={selectedUser.role === 'mentor'}
              >
                <FaEdit />
                Mentor
              </button>
              <button
                className={`${styles.roleOption} ${styles.roleAluno}`}
                onClick={() => handleChangeRole('aluno')}
                disabled={selectedUser.role === 'aluno'}
              >
                <FaUserGraduate />
                Aluno
              </button>
              <button
                className={`${styles.roleOption} ${styles.roleVisitante}`}
                onClick={() => handleChangeRole('visitante')}
                disabled={selectedUser.role === 'visitante'}
              >
                <FaEye />
                Visitante
              </button>
            </div>

            <button className={styles.closeModal} onClick={() => setShowRoleModal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
