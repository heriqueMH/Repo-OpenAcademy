import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaTimes, FaEnvelope, FaLock, FaUser, FaIdCard, FaVenusMars, FaCalendar, FaMapMarkerAlt, FaArrowLeft, FaArrowRight, FaPhone, FaGraduationCap } from 'react-icons/fa';
import api from '../../services/api';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'register';
  onRegisterSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, mode = 'login', onRegisterSuccess }) => {
  const { loginWithEmail, registerWithEmail, verifyEmail, updateUserProfile } = useAuth();
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(mode);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3 | 4>(1); // Etapas: 1=Básico, 2=Complementar, 3=Mackenzie(condicional), 4=Verificação
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');

  // Formulário - Etapa 1: Dados básicos / Etapa 2: Dados complementares
  const [formData, setFormData] = useState({
    // Etapa 1
    name: '',
    email: '',
    password: '',
    // Etapa 2 (dados complementares)
    cpf: '',
    phone: '',
    gender: '',
    education: '',
    hasBolsaFamilia: false,
    birthDate: '',
    cep: '',
    state: '',
    city: '',
    street: '',
    number: '',
    complement: '',
    // Flag Mackenzie
    isMackenzieStudent: false,
    // Etapa 3 (dados Mackenzie - condicional)
    mackenzieData: {
      registrationNumber: '',
      course: '',
      semester: '',
      campus: '',
    },
  });

  // Sempre que o modal abrir, sincroniza o modo inicial e limpa o formulário/erros
  useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
      setRegisterStep(1);
      setFormData({ 
        name: '', 
        email: '', 
        password: '',
        cpf: '',
        phone: '',
        gender: '',
        education: '',
        hasBolsaFamilia: false,
        birthDate: '',
        cep: '',
        state: '',
        city: '',
        street: '',
        number: '',
        complement: '',
        isMackenzieStudent: false,
        mackenzieData: {
          registrationNumber: '',
          course: '',
          semester: '',
          campus: '',
        },
      });
      setError('');
      setLoading(false);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validação da etapa 1
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setRegisterStep(2);
  };

  const handlePreviousStep = () => {
    setError('');
    if (registerStep === 4) {
      // Da verificação, volta para Mackenzie (se for aluno) ou para dados complementares
      setRegisterStep(formData.isMackenzieStudent ? 3 : 2);
    } else if (registerStep === 3) {
      setRegisterStep(2);
    } else if (registerStep === 2) {
      setRegisterStep(1);
    }
  };

  const validateCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(9))) {
      return false;
    }
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(10))) {
      return false;
    }
    
    return true;
  };

  const handleCpfBlur = () => {
    if (formData.cpf && !validateCPF(formData.cpf)) {
      setError('CPF inválido. Verifique os números digitados.');
    } else {
      setError('');
    }
  };

  const handleStateChange = async (state: string) => {
    setFormData({ ...formData, state, city: '' });
    setCities([]);
    
    if (!state) return;
    
    setLoadingCities(true);
    
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`);
      const data = await response.json();
      
      const cityNames = data.map((city: { nome: string }) => city.nome).sort();
      setCities(cityNames);
      
      console.log('✅ Cidades carregadas:', cityNames.length);
    } catch (err) {
      console.error('Erro ao buscar cidades:', err);
      setError('Erro ao buscar cidades. Tente novamente.');
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      return;
    }

    setLoadingCep(true);
    setError('');
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setError('CEP não encontrado');
        setLoadingCep(false);
        return;
      }
      
      const street = data.logradouro || '';
      const city = data.localidade || '';
      const state = data.uf || '';
      
      // Preenche os campos automaticamente
      setFormData(prev => ({
        ...prev,
        street,
        city,
        state,
      }));
      
      // Carrega as cidades do estado preenchido pelo CEP (sem limpar a cidade)
      if (state) {
        setLoadingCities(true);
        try {
          const citiesResponse = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`);
          const citiesData = await citiesResponse.json();
          const cityNames = citiesData.map((c: { nome: string }) => c.nome).sort();
          setCities(cityNames);
          console.log('✅ Cidades carregadas:', cityNames.length);
        } catch (err) {
          console.error('Erro ao buscar cidades:', err);
        } finally {
          setLoadingCities(false);
        }
      }
      
      console.log('✅ Endereço preenchido automaticamente:', data);
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      setError('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (currentMode === 'login') {
        await loginWithEmail(formData.email, formData.password);
        onClose();
      } else {
        // Modo registro - validações
        if (registerStep === 1) {
          handleNextStep(e);
          setLoading(false);
          return;
        }
        
        if (registerStep === 2) {
          // Etapa 2 - Validar dados complementares
          if (!formData.cpf || !formData.phone || !formData.gender || !formData.education || !formData.birthDate || !formData.cep || !formData.state || !formData.city || !formData.street) {
            setError('Por favor, preencha todos os campos obrigatórios');
            setLoading(false);
            return;
          }
          
          // Se for aluno Mackenzie, vai para etapa 3 (dados Mackenzie)
          // Se não for, pula direto para etapa 4 (verificação)
          if (formData.isMackenzieStudent) {
            setRegisterStep(3);
          } else {
            // Criar conta básica
            await registerWithEmail(formData.name, formData.email, formData.password);
            
            // Buscar o usuário recém-criado para pegar o ID
            const usersResponse = await api.get('/users', { params: { email: formData.email } });
            const createdUser = usersResponse.data[0];
            
            if (createdUser) {
              // Salvar dados complementares via API
              await api.patch(`/users/${createdUser.id}`, {
                cpf: formData.cpf,
                phone: formData.phone,
                gender: formData.gender,
                education: formData.education,
                hasBolsaFamilia: formData.hasBolsaFamilia,
                birthDate: formData.birthDate,
                address: {
                  cep: formData.cep,
                  state: formData.state,
                  city: formData.city,
                  street: formData.street,
                  number: formData.number,
                  complement: formData.complement,
                },
              });
              console.log('✅ Dados complementares salvos com sucesso!');
              
              // Buscar usuário atualizado do banco e atualizar contexto
              const updatedUserResponse = await api.get(`/users/${createdUser.id}`);
              const updatedUserData = updatedUserResponse.data;
              
              updateUserProfile({
                cpf: updatedUserData.cpf,
                gender: updatedUserData.gender,
                education: updatedUserData.education,
                hasBolsaFamilia: updatedUserData.hasBolsaFamilia,
                birthDate: updatedUserData.birthDate,
                address: updatedUserData.address,
              });
              
              console.log('✅ Contexto atualizado com dados completos:', updatedUserData);
            }
            
            setRegisterStep(4);
          }
          setLoading(false);
          return;
        }
        
        if (registerStep === 3) {
          // Etapa 3 - Dados Mackenzie (só se isMackenzieStudent = true)
          if (!formData.mackenzieData.registrationNumber || !formData.mackenzieData.course || !formData.mackenzieData.semester || !formData.mackenzieData.campus) {
            setError('Por favor, preencha todos os campos Mackenzie');
            setLoading(false);
            return;
          }
          
          // Criar conta básica
          await registerWithEmail(formData.name, formData.email, formData.password);
          
          // Buscar o usuário recém-criado para pegar o ID
          const usersResponse = await api.get('/users', { params: { email: formData.email } });
          const createdUser = usersResponse.data[0];
          
          if (createdUser) {
            // Salvar dados complementares + Mackenzie via API
            await api.patch(`/users/${createdUser.id}`, {
              cpf: formData.cpf,
              phone: formData.phone,
              gender: formData.gender,
              education: formData.education,
              hasBolsaFamilia: formData.hasBolsaFamilia,
              birthDate: formData.birthDate,
              address: {
                cep: formData.cep,
                state: formData.state,
                city: formData.city,
                street: formData.street,
                number: formData.number,
                complement: formData.complement,
              },
              isMackenzieStudent: true,
              mackenzieData: {
                registrationNumber: formData.mackenzieData.registrationNumber,
                course: formData.mackenzieData.course,
                semester: parseInt(formData.mackenzieData.semester),
                campus: formData.mackenzieData.campus,
              },
            });
            console.log('✅ Dados complementares + Mackenzie salvos com sucesso!');
            
            // Buscar usuário atualizado do banco e atualizar contexto
            const updatedUserResponse = await api.get(`/users/${createdUser.id}`);
            const updatedUserData = updatedUserResponse.data;
            
            updateUserProfile({
              cpf: updatedUserData.cpf,
              gender: updatedUserData.gender,
              education: updatedUserData.education,
              hasBolsaFamilia: updatedUserData.hasBolsaFamilia,
              birthDate: updatedUserData.birthDate,
              address: updatedUserData.address,
              isMackenzieStudent: updatedUserData.isMackenzieStudent,
              mackenzieData: updatedUserData.mackenzieData,
            });
            
            console.log('✅ Contexto atualizado com dados completos + Mackenzie:', updatedUserData);
          }
          
          // Vai para etapa 4 - Verificação de email
          setRegisterStep(4);
          setLoading(false);
          return;
        }
        
        if (registerStep === 4) {
          // Etapa 4 - Verificar código de email
          if (!verificationCode || verificationCode.length !== 6) {
            setError('Por favor, digite o código de 6 dígitos');
            setLoading(false);
            return;
          }
          
          // Verifica o código
          await verifyEmail(verificationCode);
          
          console.log('✅ Email verificado com sucesso!');
          
          // Chama callback de sucesso e fecha o modal
          if (onRegisterSuccess) {
            onRegisterSuccess();
          }
          
          // Fecha o modal
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Erro ao processar formulário:', err);
      const errorMsg = err.message || (
        currentMode === 'login'
          ? 'Email ou senha inválidos'
          : 'Erro ao criar conta. Tente novamente.'
      );
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>
            {currentMode === 'login' 
              ? 'Entrar' 
              : registerStep === 1 
                ? `Criar Conta (Etapa 1 de ${formData.isMackenzieStudent ? '4' : '3'})`
                : registerStep === 2
                  ? `Criar Conta (Etapa 2 de ${formData.isMackenzieStudent ? '4' : '3'})`
                  : registerStep === 3
                    ? 'Dados Mackenzie (Etapa 3 de 4)'
                    : `Verificar Email (Etapa ${formData.isMackenzieStudent ? '4' : '3'} de ${formData.isMackenzieStudent ? '4' : '3'})`}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar modal">
            <FaTimes />
          </button>
        </div>

        {/* Form Email/Senha */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {currentMode === 'login' ? (
            // Login Form
            <>
              <div className={styles.inputGroup}>
                <FaEnvelope className={styles.icon} />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <FaLock className={styles.icon} />
                <input
                  type="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </>
          ) : registerStep === 1 ? (
            // Register Step 1: Basic Info
            <>
              <div className={styles.inputGroup}>
                <FaUser className={styles.icon} />
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <FaEnvelope className={styles.icon} />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <FaLock className={styles.icon} />
                <input
                  type="password"
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </>
          ) : registerStep === 2 ? (
            // Register Step 2: Dados Complementares
            <>
              <div className={styles.inputGroup}>
                <FaIdCard className={styles.icon} />
                <input
                  type="text"
                  placeholder="CPF * (000.000.000-00)"
                  value={formData.cpf}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                      value = value.replace(/(\d{3})(\d)/, '$1.$2');
                      value = value.replace(/(\d{3})(\d)/, '$1.$2');
                      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    }
                    setFormData({ ...formData, cpf: value });
                  }}
                  onBlur={handleCpfBlur}
                  maxLength={14}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <FaPhone className={styles.icon} />
                <input
                  type="tel"
                  placeholder="Telefone * (00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                      value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                      value = value.replace(/(\d{5})(\d)/, '$1-$2');
                    }
                    setFormData({ ...formData, phone: value });
                  }}
                  maxLength={15}
                  required
                />
              </div>

              <div className={styles.fieldWithLabel}>
                <label>Data de Nascimento *</label>
                <div className={styles.inputGroup}>
                  <FaCalendar className={styles.icon} />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    required
                    aria-label="Data de nascimento"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <FaVenusMars className={styles.icon} />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                  aria-label="Gênero"
                >
                  <option value="">Gênero *</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro-nao-dizer">Prefiro não dizer</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <select
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  required
                  aria-label="Escolaridade"
                >
                  <option value="">Escolaridade *</option>
                  <option value="cursando-fundamental">Cursando Ensino Fundamental</option>
                  <option value="fundamental-completo">Ensino Fundamental Completo</option>
                  <option value="cursando-medio">Cursando Ensino Médio</option>
                  <option value="medio-completo">Ensino Médio Completo</option>
                  <option value="cursando-superior">Cursando Ensino Superior</option>
                  <option value="superior-completo">Ensino Superior Completo</option>
                  <option value="pos-graduacao">Pós-graduação</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.hasBolsaFamilia}
                    onChange={(e) => setFormData({ ...formData, hasBolsaFamilia: e.target.checked })}
                  />
                  Possui cadastro no Bolsa Família?
                </label>
              </div>

              <div className={styles.inputGroup}>
                <FaMapMarkerAlt className={styles.icon} />
                <input
                  type="text"
                  placeholder="CEP * (00000-000)"
                  value={formData.cep}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 5) {
                      value = value.slice(0, 5) + '-' + value.slice(5, 8);
                    }
                    setFormData({ ...formData, cep: value });
                  }}
                  onBlur={handleCepBlur}
                  maxLength={9}
                  required
                  disabled={loadingCep}
                />
                {loadingCep && <span className={styles.loadingText}>Buscando...</span>}
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <select
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    required
                    aria-label="Estado"
                  >
                    <option value="">Estado *</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    aria-label="Cidade"
                    disabled={!formData.state || loadingCities}
                  >
                    <option value="">
                      {loadingCities ? 'Carregando cidades...' : formData.state ? 'Cidade *' : 'Selecione o estado primeiro'}
                    </option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Rua *"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    placeholder="Número (opcional)"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    placeholder="Complemento (opcional)"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                  />
                </div>
              </div>

              {/* Checkbox Aluno Mackenzie */}
              <div className={styles.checkboxContainer}>
                <label className={styles.mackenzieCheckbox}>
                  <input
                    type="checkbox"
                    checked={formData.isMackenzieStudent}
                    onChange={(e) => setFormData({ ...formData, isMackenzieStudent: e.target.checked })}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>🎓 Sou aluno Mackenzie</span>
                </label>
              </div>
            </>
          ) : registerStep === 3 ? (
            // Register Step 3: Dados Mackenzie (condicional)
            <>
              <h3 className={styles.stepTitle}>Dados Mackenzie</h3>
              
              <div className={styles.inputGroup}>
                <FaIdCard className={styles.icon} />
                <input
                  type="text"
                  placeholder="RA (Matrícula) *"
                  value={formData.mackenzieData.registrationNumber}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    mackenzieData: { ...formData.mackenzieData, registrationNumber: e.target.value }
                  })}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <FaGraduationCap className={styles.icon} />
                <input
                  type="text"
                  placeholder="Curso *"
                  value={formData.mackenzieData.course}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    mackenzieData: { ...formData.mackenzieData, course: e.target.value }
                  })}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <select
                    value={formData.mackenzieData.semester}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      mackenzieData: { ...formData.mackenzieData, semester: e.target.value }
                    })}
                    required
                    aria-label="Semestre"
                  >
                    <option value="">Semestre *</option>
                    <option value="1">1º Semestre</option>
                    <option value="2">2º Semestre</option>
                    <option value="3">3º Semestre</option>
                    <option value="4">4º Semestre</option>
                    <option value="5">5º Semestre</option>
                    <option value="6">6º Semestre</option>
                    <option value="7">7º Semestre</option>
                    <option value="8">8º Semestre</option>
                    <option value="9">9º Semestre</option>
                    <option value="10">10º Semestre</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <select
                    value={formData.mackenzieData.campus}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      mackenzieData: { ...formData.mackenzieData, campus: e.target.value }
                    })}
                    required
                    aria-label="Campus"
                  >
                    <option value="">Campus *</option>
                    <option value="Higienópolis">Higienópolis</option>
                    <option value="Alphaville">Alphaville</option>
                    <option value="Campinas">Campinas</option>
                    <option value="Brasília">Brasília</option>
                    <option value="Rio de Janeiro">Rio de Janeiro</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            // Register Step 4: Verificação de Email
            <>
              <div className={styles.verificationInfo}>
                <p className={styles.infoText}>
                  📧 Enviamos um código de verificação para:
                </p>
                <p className={styles.emailHighlight}>{formData.email}</p>
                <p className={styles.infoSubtext}>
                  Digite o código de 6 dígitos abaixo para confirmar seu email.
                </p>
              </div>

              <div className={styles.inputGroup}>
                <FaEnvelope className={styles.icon} />
                <input
                  type="text"
                  placeholder="Código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  maxLength={6}
                  required
                  className={styles.codeInput}
                  autoFocus
                />
              </div>

              <div className={styles.devHint}>
                <p><strong>💡 Modo Desenvolvimento:</strong></p>
                <p>Verifique o console do navegador para ver o código de verificação gerado automaticamente.</p>
              </div>
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttonGroup}>
            {currentMode === 'register' && (registerStep === 2 || registerStep === 3 || registerStep === 4) && (
              <button 
                type="button" 
                className={styles.backBtn} 
                onClick={handlePreviousStep}
              >
                <FaArrowLeft /> Voltar
              </button>
            )}
            
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                'Aguarde...'
              ) : currentMode === 'login' ? (
                'Entrar'
              ) : registerStep === 1 ? (
                <>Próxima Etapa <FaArrowRight /></>
              ) : registerStep === 2 ? (
                formData.isMackenzieStudent ? 'Próxima Etapa' : 'Criar Conta'
              ) : registerStep === 3 ? (
                'Criar Conta'
              ) : (
                'Verificar Email'
              )}
            </button>
          </div>
        </form>

        {/* Toggle Mode */}
        <div className={styles.footer}>
          {currentMode === 'login' ? (
            <p>
              Não tem conta?{' '}
              <button
                className={styles.toggleBtn}
                onClick={() => {
                  setCurrentMode('register');
                  setRegisterStep(1);
                }}
              >
                Cadastre-se
              </button>
            </p>
          ) : (
            <p>
              Já tem conta?{' '}
              <button
                className={styles.toggleBtn}
                onClick={() => {
                  setCurrentMode('login');
                  setRegisterStep(1);
                }}
              >
                Entrar
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
