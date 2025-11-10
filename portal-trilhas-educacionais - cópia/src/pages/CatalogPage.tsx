import React, { useState, useEffect } from 'react';
import { useData, useAuth } from '../hooks';
import { CourseCard } from '../components/catalog';
import { TurmaSelectionModal } from '../components/modals';
import { FaSearch, FaFilter, FaLayerGroup } from 'react-icons/fa';
import { getUserTurmaInscriptionsWithDetails } from '../services/turma.service';
import { Trilha } from '../types';
import styles from './CatalogPage.module.css';

const CatalogPage: React.FC = () => {
  const { trilhas } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [userInscriptions, setUserInscriptions] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Estado centralizado do modal
  const [selectedTrilha, setSelectedTrilha] = useState<Trilha | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenTurmaModal = (trilha: Trilha) => {
    console.log('🎯 CatalogPage: Abrindo modal para', trilha.title);
    setSelectedTrilha(trilha);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('❌ CatalogPage: Fechando modal');
    setIsModalOpen(false);
    setSelectedTrilha(null);
  };

  useEffect(() => {
    const loadUserInscriptions = async () => {
      if (user?.id) {
        try {
          console.log('🔄 Carregando inscrições em turmas do usuário...', refreshKey);
          const turmaInscriptions = await getUserTurmaInscriptionsWithDetails(user.id);
          console.log('✅ Inscrições em turmas carregadas:', turmaInscriptions);
          setUserInscriptions(turmaInscriptions);
        } catch (error) {
          console.error('Erro ao carregar inscrições:', error);
        }
      }
    };

    loadUserInscriptions();
  }, [user, refreshKey]); // Adicionado refreshKey como dependência

  // Função para verificar o status de uma trilha baseado nas inscrições em turmas
  const getTrilhaStatus = (trilhaId: string) => {
    // Busca todas as inscrições em turmas desta trilha
    const turmaInscriptions = userInscriptions.filter(
      (insc: any) => insc.turma?.trilhaId === trilhaId
    );
    
    if (turmaInscriptions.length === 0) return null;
    
    // Pega a inscrição mais recente (ou com maior progresso)
    const latestInscription = turmaInscriptions.sort((a: any, b: any) => {
      // Prioriza completed > active > approved > pending
      const statusPriority: any = { completed: 4, active: 3, approved: 2, pending: 1 };
      return (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);
    })[0];
    
    console.log(`📊 Status da trilha ${trilhaId}:`, latestInscription);
    
    return {
      status: latestInscription.status,
      progress: latestInscription.progress || 0
    };
  };

  // Filtros
  const categories = ['all', ...new Set(trilhas.map((t) => t.category))];
  const levels = ['all', 'iniciante', 'intermediário', 'avançado'];

  const filteredTrilhas = trilhas.filter((trilha) => {
    const matchesSearch =
      trilha.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trilha.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || trilha.category === selectedCategory;

    const matchesLevel = selectedLevel === 'all' || trilha.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1>Turmas Disponíveis</h1>
          <p>
            Explore nossas turmas e encontre a trilha perfeita para você.
          </p>
        </header>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar trilhas..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.selectWrapper}>
            <FaLayerGroup className={styles.selectIcon} />
            <select
              className={styles.select}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filtrar por categoria"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Todas as Categorias' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <FaFilter className={styles.selectIcon} />
            <select
              className={styles.select}
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Filtrar por nível"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level === 'all' ? 'Todos os Níveis' : level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className={styles.resultsCount}>
          {filteredTrilhas.length} {filteredTrilhas.length === 1 ? 'trilha' : 'trilhas'}{' '}
          {filteredTrilhas.length !== trilhas.length && 'encontrada(s)'}
        </div>

        {/* Grid */}
        {filteredTrilhas.length > 0 ? (
          <div className={styles.grid}>
            {filteredTrilhas.map((trilha) => (
              <CourseCard 
                key={trilha.id} 
                trilha={trilha} 
                userStatus={getTrilhaStatus(trilha.id)}
                onOpenTurmaModal={() => handleOpenTurmaModal(trilha)}
                onEnrollSuccess={() => {
                  console.log('🎉 Inscrição bem-sucedida! Recarregando...');
                  setRefreshKey(prev => prev + 1);
                }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>Nenhuma trilha encontrada</h3>
            <p>Tente ajustar seus filtros de busca.</p>
          </div>
        )}
      </div>

      {/* Modal Centralizado */}
      {selectedTrilha && (
        <TurmaSelectionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          trilha={selectedTrilha}
          onEnrollSuccess={() => {
            console.log('🎉 Inscrição bem-sucedida! Recarregando...');
            setRefreshKey(prev => prev + 1);
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
};

export default CatalogPage;
