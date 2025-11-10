import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  // Carrega usuário e token do localStorage ao montar
  useEffect(() => {
    const storedUser = localStorage.getItem('openacademy_user');
    const storedToken = localStorage.getItem('openacademy_token');
    
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsVerified(parsedUser.isVerified);
      setToken(storedToken);
      // Define o token no axios para próximas requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  // Salva usuário no localStorage quando muda
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('openacademy_user', JSON.stringify(user));
      localStorage.setItem('openacademy_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('openacademy_user');
      localStorage.removeItem('openacademy_token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [user, token]);

  // Login com Email/Senha (SIMULADO COM JSON-SERVER)
  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      // Busca o usuário no json-server
      const response = await api.get('/users', { params: { email } });
      
      if (!response.data || response.data.length === 0) {
        throw new Error('Email ou senha inválidos');
      }
      
      const userData = response.data[0];
      
      // Verifica a senha (em produção seria comparação de hash!)
      if (userData.password !== password) {
        throw new Error('Email ou senha inválidos');
      }
      
      const formattedUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        isVerified: userData.isVerified,
        role: userData.role as 'aluno' | 'mentor' | 'coordenador' | 'admin',
        createdAt: userData.createdAt || new Date().toISOString(),
        // Dados complementares
        cpf: userData.cpf,
        gender: userData.gender,
        education: userData.education,
        hasBolsaFamilia: userData.hasBolsaFamilia,
        birthDate: userData.birthDate,
        address: userData.address,
        // Dados Mackenzie
        isMackenzieStudent: userData.isMackenzieStudent,
        mackenzieData: userData.mackenzieData,
      };
      
      // Gera token fake
      const fakeToken = `fake_token_${userData.id}_${Date.now()}`;
      
      setUser(formattedUser);
      setIsVerified(userData.isVerified);
      setToken(fakeToken);
      
      console.log('✅ Login realizado com sucesso!', formattedUser);
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  };

  // Cadastro com Email/Senha (SIMULADO COM JSON-SERVER)
  const registerWithEmail = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      console.log('Tentando registrar usuário:', { name, email });
      
      // Verifica se o email já existe
      const existingUsers = await api.get('/users', { params: { email } });
      if (existingUsers.data && existingUsers.data.length > 0) {
        throw new Error('Este email já está cadastrado');
      }
      
      // Cria o novo usuário no json-server
      const newUser = {
        name,
        email,
        password, // Em produção, isso seria hasheado!
        isVerified: false,
        role: 'aluno',
        createdAt: new Date().toISOString(),
      };
      
      const response = await api.post('/users', newUser);
      console.log('Usuário criado:', response.data);
      
      // Gera código de verificação fake (6 dígitos)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Salva o código no json-server
      await api.post('/emailVerifications', {
        email,
        code: verificationCode,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
      });
      
      const formattedUser: User = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        isVerified: false,
        role: response.data.role as 'aluno' | 'mentor' | 'coordenador' | 'admin',
        createdAt: response.data.createdAt,
      };
      
      setUser(formattedUser);
      setIsVerified(false);
      console.log('✅ User setado após registro:', formattedUser);
      console.log('✅ isAuthenticated agora deve ser:', formattedUser !== null);
      
      console.log('✅ Código de verificação (MOCK):', verificationCode);
      console.log(`📧 Em produção, este código seria enviado para: ${email}`);
    } catch (error: any) {
      console.error('Erro detalhado no registro:', error);
      console.error('Resposta da API:', error.response?.data);
      const errorMessage = error.message || error.response?.data || 'Erro ao cadastrar usuário';
      throw new Error(errorMessage);
    }
  };

  // Verificar Email com Código (SIMULADO COM JSON-SERVER)
  const verifyEmail = async (code: string): Promise<void> => {
    try {
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Busca o código de verificação no json-server
      const verificationsResponse = await api.get('/emailVerifications', {
        params: { email: user.email, code }
      });
      
      if (!verificationsResponse.data || verificationsResponse.data.length === 0) {
        throw new Error('Código de verificação inválido');
      }
      
      const verification = verificationsResponse.data[0];
      
      // Verifica se o código expirou
      if (new Date(verification.expiresAt) < new Date()) {
        throw new Error('Código de verificação expirado');
      }
      
      // Atualiza o usuário para verificado no json-server
      await api.patch(`/users/${user.id}`, { isVerified: true });
      
      // Gera token fake (em produção seria JWT real)
      const fakeToken = `fake_token_${user.id}_${Date.now()}`;
      
      // Atualiza o estado local
      const updatedUser = { ...user, isVerified: true };
      setUser(updatedUser);
      setIsVerified(true);
      setToken(fakeToken);
      
      console.log('✅ Email verificado com sucesso!');
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || 'Código de verificação inválido';
      throw new Error(errorMessage);
    }
  };

  // Reenviar Código de Verificação (SIMULADO)
  const resendVerificationCode = async (): Promise<void> => {
    try {
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Gera novo código
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Atualiza ou cria novo código no json-server
      const existingVerifications = await api.get('/emailVerifications', {
        params: { email: user.email }
      });
      
      if (existingVerifications.data && existingVerifications.data.length > 0) {
        // Atualiza o existente
        await api.patch(`/emailVerifications/${existingVerifications.data[0].id}`, {
          code: verificationCode,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        });
      } else {
        // Cria novo
        await api.post('/emailVerifications', {
          email: user.email,
          code: verificationCode,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        });
      }
      
      console.log('✅ Novo código de verificação (MOCK):', verificationCode);
      console.log(`📧 Em produção, este código seria reenviado para: ${user.email}`);
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || 'Erro ao reenviar código';
      throw new Error(errorMessage);
    }
  };

  // Atualizar isVerified após verificação de email
  const updateVerification = (verified: boolean): void => {
    if (user) {
      const updatedUser = { ...user, isVerified: verified };
      setUser(updatedUser);
      setIsVerified(verified);
    }
  };

  // Atualizar perfil do usuário (mantém sincronização)
  const updateUserProfile = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Se isVerified foi atualizado, sincroniza
      if ('isVerified' in userData) {
        setIsVerified(userData.isVerified!);
      }
    }
  };

  // Logout
  const logout = (): void => {
    setUser(null);
    setIsVerified(false);
    setToken(null);
    localStorage.removeItem('openacademy_user');
    localStorage.removeItem('openacademy_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isVerified,
        isAuthenticated,
        loginWithEmail,
        registerWithEmail,
        verifyEmail,
        resendVerificationCode,
        logout,
        updateVerification,
        updateUserProfile,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};