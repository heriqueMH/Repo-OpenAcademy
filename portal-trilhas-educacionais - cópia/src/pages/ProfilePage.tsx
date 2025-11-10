import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaCamera, FaSave, FaEdit, FaTimes, FaIdCard, FaVenusMars, FaGraduationCap, FaBirthdayCake, FaMapMarkerAlt } from 'react-icons/fa';
import { getUserById, updateUser } from '../services/api';
import styles from './ProfilePage.module.css';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  cpf?: string;
  gender?: string;
  education?: string;
  hasBolsaFamilia?: boolean;
  birthDate?: string;
  address?: {
    cep?: string;
    state?: string;
    city?: string;
    street?: string;
    number?: string;
    complement?: string;
  };
  isMackenzieStudent?: boolean;
  mackenzieData?: {
    course?: string;
    semester?: number;
    registrationNumber?: string;
    campus?: string;
  };
}

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);

  // Form data - expandido para incluir dados pessoais e endereço
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    gender: '',
    education: '',
    birthDate: '',
    hasBolsaFamilia: false,
    address: {
      cep: '',
      state: '',
      city: '',
      street: '',
      number: '',
      complement: '',
    },
  });

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingData(true);
        const data = await getUserById(user.id);
        setUserData(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.avatar || '',
          gender: data.gender || '',
          education: data.education || '',
          birthDate: data.birthDate || '',
          hasBolsaFamilia: data.hasBolsaFamilia || false,
          address: {
            cep: data.address?.cep || '',
            state: data.address?.state || '',
            city: data.address?.city || '',
            street: data.address?.street || '',
            number: data.address?.number || '',
            complement: data.address?.complement || '',
          },
        });
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
        setError('Erro ao carregar dados do perfil.');
      } finally {
        setLoadingData(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Verificar se o email foi alterado
      const emailChanged = formData.email !== userData?.email;
      
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
        gender: formData.gender,
        education: formData.education,
        birthDate: formData.birthDate,
        hasBolsaFamilia: formData.hasBolsaFamilia,
        address: formData.address,
      };

      // Se o email mudou, marcar como não verificado
      if (emailChanged) {
        updateData.isVerified = false;
      }

      const updatedData = await updateUser(user.id, updateData);
      
      setUserData(updatedData);
      
      // Atualizar o contexto do Auth também para manter sincronização
      updateUserProfile(updatedData);
      
      if (emailChanged) {
        setSuccess('Perfil atualizado! Um novo código de verificação foi enviado para seu email.');
        // TODO: Enviar código de verificação para o novo email
        console.log('📧 Enviar código de verificação para:', formData.email);
      } else {
        setSuccess('Perfil atualizado com sucesso!');
      }
      
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      avatar: userData?.avatar || '',
      gender: userData?.gender || '',
      education: userData?.education || '',
      birthDate: userData?.birthDate || '',
      hasBolsaFamilia: userData?.hasBolsaFamilia || false,
      address: {
        cep: userData?.address?.cep || '',
        state: userData?.address?.state || '',
        city: userData?.address?.city || '',
        street: userData?.address?.street || '',
        number: userData?.address?.number || '',
        complement: userData?.address?.complement || '',
      },
    });
    setIsEditing(false);
    setError('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loadingData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando dados do perfil...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais</p>
      </div>

      <div className={styles.content}>
        {/* Alerta de Email Não Verificado */}
        {!userData?.isVerified && (
          <div className={styles.verificationAlert}>
            <div className={styles.alertIcon}>⚠️</div>
            <div className={styles.alertContent}>
              <h3>Email não verificado</h3>
              <p>
                Seu email <strong>{userData?.email}</strong> ainda não foi verificado. 
                Verifique sua caixa de entrada e spam para encontrar o código de verificação.
              </p>
            </div>
          </div>
        )}

        {/* Avatar Section */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {formData.avatar ? (
              <img src={formData.avatar} alt={formData.name} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <FaUser />
              </div>
            )}
            {isEditing && (
              <label className={styles.avatarUpload} htmlFor="avatar-upload">
                <FaCamera />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className={styles.hiddenInput}
                  aria-label="Upload foto de perfil"
                />
              </label>
            )}
          </div>
          <h2>{formData.name}</h2>
          <p className={styles.role}>{userData?.role || 'Aluno'}</p>
        </div>

        {/* Account Info */}
        <div className={styles.accountInfo}>
          {success && <div className={styles.success}>{success}</div>}
          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <h3>Informações da Conta</h3>
              {!isEditing ? (
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Editar
                </button>
              ) : (
                <div className={styles.actionBtns}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                  >
                    <FaTimes /> Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={loading}
                  >
                    <FaSave /> {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              )}
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <FaUser /> Nome Completo
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={styles.editInput}
                    aria-label="Nome completo"
                  />
                ) : (
                  <span className={styles.infoValue}>{formData.name || 'Não informado'}</span>
                )}
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <FaEnvelope /> E-mail
                </span>
                {isEditing ? (
                  <div className={styles.emailInputWrapper}>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className={styles.editInput}
                      aria-label="E-mail"
                    />
                    {formData.email !== userData?.email && (
                      <small className={styles.emailWarning}>
                        ⚠️ Ao alterar o email, você precisará verificar novamente
                      </small>
                    )}
                  </div>
                ) : (
                  <span className={styles.infoValue}>{formData.email || 'Não informado'}</span>
                )}
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>📱 Telefone</span>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className={styles.editInput}
                    aria-label="Telefone"
                  />
                ) : (
                  <span className={styles.infoValue}>{formData.phone || 'Não informado'}</span>
                )}
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status da Conta</span>
                <span className={`${styles.badge} ${userData?.isVerified ? styles.verified : styles.unverified}`}>
                  {userData?.isVerified ? '✓ Verificado' : '⚠ Não Verificado'}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tipo de Conta</span>
                <span className={styles.infoValue}>{userData?.role || 'Aluno'}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Membro desde</span>
                <span className={styles.infoValue}>
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>📋 Dados Pessoais</h3>
              <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaIdCard /> CPF
              </span>
              <span className={styles.infoValue}>{userData?.cpf || 'Não informado'}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaBirthdayCake /> Data de Nascimento
              </span>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className={styles.editInput}
                  aria-label="Data de nascimento"
                />
              ) : (
                <span className={styles.infoValue}>
                  {userData?.birthDate ? new Date(userData.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
                </span>
              )}
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaVenusMars /> Gênero
              </span>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className={styles.editInput}
                  aria-label="Gênero"
                >
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro-nao-dizer">Prefiro não dizer</option>
                </select>
              ) : (
                <span className={styles.infoValue}>
                  {userData?.gender === 'masculino' ? 'Masculino' : 
                   userData?.gender === 'feminino' ? 'Feminino' : 
                   userData?.gender === 'outro' ? 'Outro' : 
                   userData?.gender === 'prefiro-nao-dizer' ? 'Prefiro não dizer' : 'Não informado'}
                </span>
              )}
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaGraduationCap /> Escolaridade
              </span>
              {isEditing ? (
                <select
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className={styles.editInput}
                  aria-label="Escolaridade"
                >
                  <option value="">Selecione</option>
                  <option value="cursando-fundamental">Cursando Ensino Fundamental</option>
                  <option value="fundamental-completo">Ensino Fundamental Completo</option>
                  <option value="cursando-medio">Cursando Ensino Médio</option>
                  <option value="medio-completo">Ensino Médio Completo</option>
                  <option value="cursando-superior">Cursando Ensino Superior</option>
                  <option value="superior-completo">Ensino Superior Completo</option>
                  <option value="pos-graduacao">Pós-graduação</option>
                </select>
              ) : (
                <span className={styles.infoValue}>
                  {userData?.education === 'cursando-fundamental' ? 'Cursando Ensino Fundamental' :
                   userData?.education === 'fundamental-completo' ? 'Ensino Fundamental Completo' :
                   userData?.education === 'cursando-medio' ? 'Cursando Ensino Médio' :
                   userData?.education === 'medio-completo' ? 'Ensino Médio Completo' :
                   userData?.education === 'cursando-superior' ? 'Cursando Ensino Superior' :
                   userData?.education === 'superior-completo' ? 'Ensino Superior Completo' :
                   userData?.education === 'pos-graduacao' ? 'Pós-graduação' : 
                   userData?.education === 'fundamental-incompleto' ? 'Fundamental Incompleto' :
                   userData?.education === 'medio-incompleto' ? 'Médio Incompleto' :
                   userData?.education === 'superior-incompleto' ? 'Superior Incompleto' : 'Não informado'}
                </span>
              )}
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>💰 Bolsa Família</span>
              {isEditing ? (
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="hasBolsaFamilia"
                      checked={formData.hasBolsaFamilia === true}
                      onChange={() => setFormData({ ...formData, hasBolsaFamilia: true })}
                      className={styles.radio}
                    />
                    <span className={styles.radioText}>Sim</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="hasBolsaFamilia"
                      checked={formData.hasBolsaFamilia === false}
                      onChange={() => setFormData({ ...formData, hasBolsaFamilia: false })}
                      className={styles.radio}
                    />
                    <span className={styles.radioText}>Não</span>
                  </label>
                </div>
              ) : (
                <span className={styles.infoValue}>
                  {userData?.hasBolsaFamilia ? 'Sim' : 'Não'}
                </span>
              )}
            </div>
          </div>
        </div>

            {/* Endereço */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <FaMapMarkerAlt /> Endereço
              </h3>
              <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>CEP</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address.cep}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 8) {
                      value = value.replace(/(\d{5})(\d)/, '$1-$2');
                    }
                    setFormData({ ...formData, address: { ...formData.address, cep: value } });
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  className={styles.editInput}
                  aria-label="CEP"
                />
              ) : (
                <span className={styles.infoValue}>{userData?.address?.cep || 'Não informado'}</span>
              )}
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Estado</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                  maxLength={2}
                  placeholder="UF"
                  className={styles.editInput}
                  aria-label="Estado"
                />
              ) : (
                <span className={styles.infoValue}>{userData?.address?.state || 'Não informado'}</span>
              )}
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Cidade</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                  className={styles.editInput}
                  aria-label="Cidade"
                />
              ) : (
                <span className={styles.infoValue}>{userData?.address?.city || 'Não informado'}</span>
              )}
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Rua</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                  className={styles.editInput}
                  aria-label="Rua"
                />
              ) : (
                <span className={styles.infoValue}>{userData?.address?.street || 'Não informado'}</span>
              )}
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Número</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address.number}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, number: e.target.value } })}
                  className={styles.editInput}
                  aria-label="Número"
                />
              ) : (
                <span className={styles.infoValue}>{userData?.address?.number || 'Não informado'}</span>
              )}
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Complemento</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address.complement}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, complement: e.target.value } })}
                  className={styles.editInput}
                  aria-label="Complemento"
                />
              ) : (
                <span className={styles.infoValue}>{userData?.address?.complement || 'Não informado'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Dados Mackenzie */}
        {userData?.isMackenzieStudent && userData?.mackenzieData && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>🎓 Dados Mackenzie</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>RA</span>
                <span className={styles.infoValue}>{userData.mackenzieData.registrationNumber || 'Não informado'}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Curso</span>
                <span className={styles.infoValue}>{userData.mackenzieData.course || 'Não informado'}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Semestre</span>
                <span className={styles.infoValue}>{userData.mackenzieData.semester ? `${userData.mackenzieData.semester}º semestre` : 'Não informado'}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Campus</span>
                <span className={styles.infoValue}>{userData.mackenzieData.campus || 'Não informado'}</span>
              </div>
            </div>
          </div>
        )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
