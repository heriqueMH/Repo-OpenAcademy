import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css'; // Importando estilos específicos do cabeçalho

const Header: React.FC = () => {
    return (
        <header className={styles.header}>
            <div className="logo">
                <h1>Open Academy</h1>
            </div>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/catalog">Catálogo</Link>
                    </li>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;