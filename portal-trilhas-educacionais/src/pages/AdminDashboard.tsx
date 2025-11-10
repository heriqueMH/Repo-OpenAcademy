import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBook, FaClipboardList, FaChartLine, FaUserGraduate, FaCertificate } from 'react-icons/fa';
import { getAllUsers, getAllTrilhas } from '../services/api';
import api from '../services/api';
import styles from './AdminDashboard.module.css';

interface AdminStats {
  totalUsers: number;
  totalTrilhas: number;
  totalInscriptions: number;
  activeInscriptions: number;
  completedTrilhas: number;
  totalCertificates: number;
}

interface Inscription {
  id: string;
  status: string;
  progress: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTrilhas: 0,
    totalInscriptions: 0,
    activeInscriptions: 0,
    completedTrilhas: 0,
    totalCertificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [users, trilhas, turmaInscriptionsData, certificatesData] = await Promise.all([
          getAllUsers(),
          getAllTrilhas(),
          api.get('/turma-inscriptions'),
          api.get('/certificates'),
        ]);

        const turmaInscriptions = turmaInscriptionsData.data;
        const certificates = certificatesData.data;
        
        // Contar apenas inscrições ativas, aprovadas ou concluídas
        const activeInscriptions = turmaInscriptions.filter(
          (i: Inscription) => ['active', 'approved'].includes(i.status)
        ).length;
        
        const completedTrilhas = turmaInscriptions.filter(
          (i: Inscription) => i.status === 'completed'
        ).length;

        setStats({
          totalUsers: users.length,
          totalTrilhas: trilhas.length,
          totalInscriptions: turmaInscriptions.length,
          activeInscriptions,
          completedTrilhas,
          totalCertificates: certificates.length, // Contar certificados reais emitidos
        });
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Painel Administrativo</h1>
        <p>Visão geral do Portal de Trilhas Educacionais</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.users}`}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>Total de Usuários</h3>
            <p className={styles.statNumber}>{stats.totalUsers}</p>
            <span className={styles.statLabel}>usuários cadastrados</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.trilhas}`}>
          <div className={styles.statIcon}>
            <FaBook />
          </div>
          <div className={styles.statContent}>
            <h3>Trilhas Disponíveis</h3>
            <p className={styles.statNumber}>{stats.totalTrilhas}</p>
            <span className={styles.statLabel}>trilhas educacionais</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.inscriptions}`}>
          <div className={styles.statIcon}>
            <FaClipboardList />
          </div>
          <div className={styles.statContent}>
            <h3>Total de Inscrições</h3>
            <p className={styles.statNumber}>{stats.totalInscriptions}</p>
            <span className={styles.statLabel}>inscrições realizadas</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.active}`}>
          <div className={styles.statIcon}>
            <FaUserGraduate />
          </div>
          <div className={styles.statContent}>
            <h3>Inscrições Ativas</h3>
            <p className={styles.statNumber}>{stats.activeInscriptions}</p>
            <span className={styles.statLabel}>alunos estudando</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.completed}`}>
          <div className={styles.statIcon}>
            <FaChartLine />
          </div>
          <div className={styles.statContent}>
            <h3>Trilhas Concluídas</h3>
            <p className={styles.statNumber}>{stats.completedTrilhas}</p>
            <span className={styles.statLabel}>finalizações</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.certificates}`}>
          <div className={styles.statIcon}>
            <FaCertificate />
          </div>
          <div className={styles.statContent}>
            <h3>Certificados Emitidos</h3>
            <p className={styles.statNumber}>{stats.totalCertificates}</p>
            <span className={styles.statLabel}>certificados gerados</span>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Ações Rápidas</h2>
        <div className={styles.actionsGrid}>
          <Link to="/admin/trilhas" className={styles.actionCard}>
            <FaBook />
            <span>Gerenciar Trilhas</span>
          </Link>
          <Link to="/admin/usuarios" className={styles.actionCard}>
            <FaUsers />
            <span>Gerenciar Usuários</span>
          </Link>
          <Link to="/admin/inscricoes" className={styles.actionCard}>
            <FaClipboardList />
            <span>Ver Inscrições</span>
          </Link>
          <Link to="/admin/relatorios" className={styles.actionCard}>
            <FaChartLine />
            <span>Relatórios</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
