import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css'; // Importando estilos específicos para a Sidebar

const Sidebar: React.FC = () => {
    return (
        <div className={styles.sidebar}>
            <h2>Navegação</h2>
            <ul>
                <li>
                    <Link to="/">Início</Link>
                </li>
                <li>
                    <Link to="/catalog">Turmas</Link>
                </li>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/account">Perfil</Link>
                </li>
                <li>
                    <Link to="/login">Login</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;