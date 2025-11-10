import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div className={styles.footerLogo}>
            <img src="/logo-full.png" alt="Open Academy | Mackenzie" />
          </div>
          <p>
            Transformando educação através de trilhas de aprendizado personalizadas
            e tecnologia de ponta.
          </p>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>Links Rápidos</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/catalog">Catálogo</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/profile">Meu Perfil</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Suporte</h3>
          <ul>
            <li><Link to="/">FAQ</Link></li>
            <li><Link to="/">Central de Ajuda</Link></li>
            <li><Link to="/">Contato</Link></li>
            <li><Link to="/">Termos de Uso</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Contato</h3>
          <p>Email: contato@openacademy.mackenzie.br</p>
          <p>Telefone: (11) 1234-5678</p>
          <p>São Paulo, SP - Brasil</p>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Open Academy | Mackenzie. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;