import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { EnrollmentModal, LoginModal, VerificationModal } from '../components/modals';

type Stage = 'none' | 'login' | 'verify' | 'enroll';

type StartEnrollmentOptions = {
  trilhaId: string;
  trilhaTitle: string;
  onSuccess?: () => void;
};

interface EnrollmentFlowContextType {
  startEnrollment: (options: StartEnrollmentOptions) => void;
}

const EnrollmentFlowContext = createContext<EnrollmentFlowContextType | undefined>(undefined);

export const EnrollmentFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isVerified } = useAuth();

  const [stage, setStage] = useState<Stage>('none');
  const requestRef = useRef<StartEnrollmentOptions | null>(null);
  const requestedFlagRef = useRef(false);

  const resetFlow = () => {
    setStage('none');
    requestedFlagRef.current = false;
    requestRef.current = null;
  };

  const startEnrollment = (options: StartEnrollmentOptions) => {
    requestRef.current = options;
    requestedFlagRef.current = true;

    if (!isAuthenticated) {
      // Usuário não autenticado → LoginModal (já coleta dados complementares na etapa 2)
      setStage('login');
      return;
    }
    
    if (!isVerified) {
      // Usuário autenticado mas não verificado → VerificationModal
      setStage('verify');
      return;
    }
    
    // Usuário autenticado e verificado → EnrollmentModal direto
    setStage('enroll');
  };

  // Quando o usuário se autentica durante o fluxo de login, avança para verificação
  useEffect(() => {
    console.log('🔍 Debug EnrollmentFlow:', { stage, isAuthenticated, isVerified, hasRequest: requestedFlagRef.current });
    if (stage === 'login' && isAuthenticated && requestedFlagRef.current) {
      console.log('✅ Avançando para verificação de email');
      setStage('verify');
    }
  }, [isAuthenticated, isVerified, stage]);

  // Quando o usuário verifica o email, avança para inscrição
  useEffect(() => {
    if (stage === 'verify' && isAuthenticated && isVerified && requestedFlagRef.current) {
      console.log('✅ Email verificado - avançando para inscrição');
      setStage('enroll');
    }
  }, [isAuthenticated, isVerified, stage]);

  return (
    <EnrollmentFlowContext.Provider value={{ startEnrollment }}>
      {children}

      {/* Modais Globais - Controlados centralmente */}
      {/* 1. Login/Registro (com dados complementares na etapa 2) */}
      <LoginModal
        key={`login-${stage === 'login' ? 'open' : 'closed'}`}
        isOpen={stage === 'login'}
        onClose={resetFlow}
        mode="register"
        onRegisterSuccess={() => {
          console.log('🎯 onRegisterSuccess chamado - usuário registrado com dados complementares');
          requestedFlagRef.current = true;
          // Após registro completo (etapa 1 + 2), vai para verificação de email
          setStage('verify');
        }}
      />

      {/* 2. Verificação de Email */}
      <VerificationModal
        isOpen={stage === 'verify'}
        onClose={resetFlow}
        onSuccess={() => {
          // Verificação concluída, vai para inscrição
          requestedFlagRef.current = true;
          setStage('enroll');
        }}
      />

      {/* 3. Confirmação de Inscrição */}
      {requestRef.current && (
        <EnrollmentModal
          isOpen={stage === 'enroll'}
          onClose={resetFlow}
          trilhaId={requestRef.current.trilhaId}
          trilhaTitle={requestRef.current.trilhaTitle}
          onSuccess={() => {
            // Conclui inscrição e notifica interessado
            try {
              requestRef.current?.onSuccess?.();
            } finally {
              resetFlow();
            }
          }}
        />
      )}
    </EnrollmentFlowContext.Provider>
  );
};

export const useEnrollmentFlow = (): EnrollmentFlowContextType => {
  const ctx = useContext(EnrollmentFlowContext);
  if (!ctx) throw new Error('useEnrollmentFlow deve ser usado dentro de EnrollmentFlowProvider');
  return ctx;
};
