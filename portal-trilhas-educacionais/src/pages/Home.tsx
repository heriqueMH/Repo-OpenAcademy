import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { FaGraduationCap, FaCertificate, FaUsers, FaRocket } from 'react-icons/fa';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLogo}>
            <img src="/logo.png" alt="Open Academy" />
          </div>
          <h1 className={styles.heroTitle}>
            Bem-vindo à Open Academy
          </h1>
          <p className={styles.heroSubtitle}>
            O seu hub centralizado para trilhas educacionais do Mackenzie
          </p>
          <p className={styles.heroDescription}>
            Descubra, aprenda e evolua sua carreira com trilhas educacionais personalizadas.
            Acesse conteúdos de qualidade, acompanhe seu progresso e conquiste certificados.
          </p>
          <div className={styles.heroActions}>
            <Link to="/catalog" className={styles.btnPrimary}>
              Explorar Trilhas
            </Link>
            {!isAuthenticated && (
              <Link to="/catalog" className={styles.btnSecondary}>
                Começar Agora
              </Link>
            )}
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.heroImagePlaceholder}>
            <FaGraduationCap />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Por que escolher a Open Academy?</h2>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FaRocket />
              </div>
              <h3>Trilhas Personalizadas</h3>
              <p>
                Acesse trilhas educacionais criadas por mentores especialistas do Mackenzie,
                focadas em habilidades práticas e relevantes para o mercado.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FaGraduationCap />
              </div>
              <h3>Acompanhamento de Progresso</h3>
              <p>
                Monitore seu avanço em tempo real, com métricas detalhadas sincronizadas
                diretamente do nosso LMS (Moodle).
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FaCertificate />
              </div>
              <h3>Certificados Reconhecidos</h3>
              <p>
                Conquiste certificados oficiais ao completar trilhas, validando suas
                competências para o mercado de trabalho.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FaUsers />
              </div>
              <h3>Comunidade Ativa</h3>
              <p>
                Faça parte de uma comunidade de alunos, mentores e coordenadores engajados
                no seu desenvolvimento profissional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Pronto para começar sua jornada?</h2>
          <p>
            Explore nossas turmas disponíveis e dê o próximo passo
            na sua carreira.
          </p>
          <Link to="/catalog" className={styles.btnCta}>
            Ver Turmas Disponíveis
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;