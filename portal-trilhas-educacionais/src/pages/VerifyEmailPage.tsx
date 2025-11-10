import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import styles from './VerifyEmailPage.module.css';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateVerification } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verificando seu e-mail...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token de verificação não encontrado na URL.');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        
        setStatus('success');
        setMessage(response.data.message || 'E-mail verificado com sucesso!');
        
        // Atualizar o estado de verificação no contexto
        updateVerification(true);
        
        // Redirecionar para o catálogo após 3 segundos
        setTimeout(() => {
          navigate('/catalog');
        }, 3000);
        
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || 'Erro ao verificar e-mail. O token pode estar inválido ou expirado.';
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, updateVerification, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <>
            <div className={styles.spinner}></div>
            <h1>Verificando...</h1>
            <p>{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className={styles.iconSuccess}>✓</div>
            <h1>E-mail Verificado!</h1>
            <p>{message}</p>
            <p className={styles.subtext}>Redirecionando para o catálogo...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className={styles.iconError}>✕</div>
            <h1>Erro na Verificação</h1>
            <p>{message}</p>
            <button 
              className={styles.button} 
              onClick={() => navigate('/catalog')}
            >
              Ir para o Catálogo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
