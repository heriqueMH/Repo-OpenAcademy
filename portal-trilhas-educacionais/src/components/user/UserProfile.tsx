import React from 'react';

const UserProfile: React.FC = () => {
    // Aqui você pode adicionar a lógica para buscar e exibir as informações do usuário

    return (
        <div className="user-profile">
            <h1>Perfil do Usuário</h1>
            {/* Exibir informações do usuário aqui */}
            <p>Nome: [Nome do Usuário]</p>
            <p>Email: [Email do Usuário]</p>
            <h2>Progresso nas Trilhas</h2>
            {/* Exibir progresso nas trilhas aqui */}
        </div>
    );
};

export default UserProfile;