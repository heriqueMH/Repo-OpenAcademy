import React, { useState } from 'react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Aqui você pode adicionar a lógica de autenticação
        // Exemplo: chamar uma função de login do contexto ou serviço
        if (email === '' || password === '') {
            setError('Por favor, preencha todos os campos.');
        } else {
            // Lógica de autenticação
            console.log('Login realizado com:', { email, password });
            // Resetar campos e erro após login bem-sucedido
            setEmail('');
            setPassword('');
            setError('');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Senha:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
};

export default Login;