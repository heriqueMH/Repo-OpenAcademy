import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { getAllTrilhas, deleteTrilha, updateTrilha, getAllUsers, createTrilha } from '../services/api';
import { Trilha, User } from '../types';
import api from '../services/api';
import styles from './AdminTrilhas.module.css';

interface TrilhaWithStats extends Trilha {
  totalInscricoes: number; // Total de inscrições em todas as turmas desta trilha
}

const AdminTrilhas: React.FC = () => {
  const [trilhas, setTrilhas] = useState<TrilhaWithStats[]>([]);
  const [filteredTrilhas, setFilteredTrilhas] = useState<TrilhaWithStats[]>([]);
  const [totalInscricoesGeral, setTotalInscricoesGeral] = useState(0);
  const [mentores, setMentores] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTrilha, setEditingTrilha] = useState<Trilha | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mentorId: '',
    duration: 0,
    level: 'iniciante' as 'iniciante' | 'intermediário' | 'avançado',
    category: '',
    thumbnail: '',
  });

  useEffect(() => {
    loadTrilhas();
    loadMentores();
  }, []);

  const loadMentores = async () => {
    try {
      const users = await getAllUsers();
      const mentoresList = users.filter((user: User) => user.role === 'mentor');
      setMentores(mentoresList);
    } catch (err) {
      console.error('Erro ao carregar mentores:', err);
    }
  };

  const loadTrilhas = async () => {
    try {
      setLoading(true);
      const [trilhasData, turmasData, inscricoesData] = await Promise.all([
        getAllTrilhas(),
        api.get('/turmas'),
        api.get('/turma-inscriptions')
      ]);
      
      // Calcular total de inscrições únicas por trilha
      const trilhasComStats: TrilhaWithStats[] = trilhasData.map((trilha: Trilha) => {
        // Encontrar todas as turmas desta trilha (garantir comparação de strings)
        const turmasDaTrilha = turmasData.data.filter((turma: any) => 
          String(turma.trilhaId) === String(trilha.id)
        );
        const turmaIds = turmasDaTrilha.map((turma: any) => turma.id);
        
        // Contar apenas inscrições ativas, aprovadas ou concluídas (excluir pending e rejected)
        const inscricoesDaTrilha = inscricoesData.data.filter((insc: any) => 
          turmaIds.includes(insc.turmaId) && 
          ['active', 'approved', 'completed'].includes(insc.status)
        );
        const usuariosUnicos = new Set(inscricoesDaTrilha.map((insc: any) => insc.userId));
        const totalInscricoes = usuariosUnicos.size;
        
        console.log(`Trilha "${trilha.title}" (ID: ${trilha.id}):`, {
          turmas: turmasDaTrilha.length,
          turmaIds,
          inscricoes: inscricoesDaTrilha.length,
          usuariosUnicos: Array.from(usuariosUnicos),
          totalInscricoes
        });
        
        return {
          ...trilha,
          totalInscricoes
        };
      });
      setTrilhas(trilhasComStats);
      setFilteredTrilhas(trilhasComStats);
      
      // Calcular total REAL de inscrições (não usuários únicos)
      const totalRealInscricoes = inscricoesData.data.filter((insc: any) => 
        ['active', 'approved', 'completed'].includes(insc.status)
      ).length;
      setTotalInscricoesGeral(totalRealInscricoes);
      
      // Log do total
      console.log('Total REAL de inscrições (todas):', totalRealInscricoes);
      console.log('Total de usuários únicos somados:', trilhasComStats.reduce((acc, t) => acc + t.totalInscricoes, 0));
      console.log('Detalhamento por trilha:', trilhasComStats.map(t => ({
        trilha: t.title,
        usuariosUnicos: t.totalInscricoes
      })));
      
    } catch (err) {
      console.error('Erro ao carregar trilhas:', err);
      setError('Erro ao carregar trilhas.');
    } finally {
      setLoading(false);
    }
  };

  const filterTrilhas = () => {
    let filtered = [...trilhas];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(trilha =>
        trilha.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trilha.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de nível
    if (filterLevel !== 'all') {
      filtered = filtered.filter(trilha => trilha.level === filterLevel);
    }

    setFilteredTrilhas(filtered);
  };

  useEffect(() => {
    filterTrilhas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterLevel, trilhas]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a trilha "${title}"?`)) {
      return;
    }

    try {
      await deleteTrilha(id);
      setTrilhas(trilhas.filter(t => t.id !== id));
      setSuccess('Trilha excluída com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao excluir trilha:', err);
      setError('Erro ao excluir trilha.');
      setTimeout(() => setError(''), 3000);
    }
  };

    const handleEdit = (trilha: Trilha) => {
    setIsCreating(false);
    setEditingTrilha(trilha);
    setFormData({
      title: trilha.title,
      description: trilha.description,
      mentorId: trilha.mentorId,
      duration: trilha.duration,
      level: trilha.level,
      category: trilha.category,
      thumbnail: trilha.thumbnail || '',
    });
    setImagePreview(trilha.thumbnail || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTrilha) return;

    try {
      const updatedTrilha = {
        ...editingTrilha,
        ...formData,
      };
      
      await updateTrilha(editingTrilha.id, updatedTrilha);
      
      // Atualizar mantendo totalInscricoes
      setTrilhas(trilhas.map(t => 
        t.id === editingTrilha.id ? { ...updatedTrilha, totalInscricoes: t.totalInscricoes } as TrilhaWithStats : t
      ));
      
      setSuccess('Trilha atualizada com sucesso!');
      setShowEditModal(false);
      setEditingTrilha(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao atualizar trilha:', err);
      setError('Erro ao atualizar trilha.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'enrolledCount' || name === 'rating' 
        ? Number(value) 
        : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({
          ...prev,
          thumbnail: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewTrilha = () => {
    setIsCreating(true);
    setEditingTrilha(null);
    setFormData({
      title: '',
      description: '',
      mentorId: '',
      duration: 0,
      level: 'iniciante',
      category: '',
      thumbnail: '',
    });
    setImagePreview('');
    setShowEditModal(true);
  };

  const handleCreateTrilha = async () => {
    try {
      const newTrilha = {
        ...formData,
        thumbnail: '/images/default-course.jpg',
        enrolledCount: 0,
        rating: 0,
      };
      
      const createdTrilha = await createTrilha(newTrilha);
      setTrilhas([...trilhas, createdTrilha]);
      
      setSuccess('Trilha criada com sucesso!');
      setShowEditModal(false);
      setIsCreating(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao criar trilha:', err);
      setError('Erro ao criar trilha.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleModalSave = () => {
    if (isCreating) {
      handleCreateTrilha();
    } else {
      handleSaveEdit();
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando trilhas...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Gerenciar Trilhas</h1>
          <p>Administre as trilhas educacionais disponíveis</p>
        </div>
        <button className={styles.addButton} onClick={handleNewTrilha}>
          <FaPlus />
          <span>Nova Trilha</span>
        </button>
      </div>

      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.selectWrapper}>
          <FaFilter className={styles.selectIcon} />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className={styles.select}
            aria-label="Filtrar por nível"
          >
            <option value="all">Todos os níveis</option>
            <option value="iniciante">Iniciante</option>
            <option value="intermediário">Intermediário</option>
            <option value="avançado">Avançado</option>
          </select>
        </div>
      </div>

      <div className={styles.inscriptionsBar}>
        <div className={styles.inscriptionStat}>
          <strong className={styles.inscriptionValue}>{filteredTrilhas.length}</strong>
          <span className={styles.inscriptionLabel}>trilhas encontradas</span>
        </div>
        <div className={styles.inscriptionStat}>
          <strong className={styles.inscriptionValue}>{totalInscricoesGeral}</strong>
          <span className={styles.inscriptionLabel}>total de inscrições</span>
        </div>
      </div>

      <div className={styles.trilhasList}>
        {filteredTrilhas.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhuma trilha encontrada</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.col1}>Trilha</div>
              <div className={styles.col3}>Nível</div>
              <div className={styles.col4}>Duração</div>
              <div className={styles.col5}>Inscritos</div>
              <div className={styles.col6}>Avaliação</div>
              <div className={styles.col7}>Ações</div>
            </div>

            {filteredTrilhas.map(trilha => (
              <div key={trilha.id} className={styles.tableRow}>
                <div className={styles.col1}>
                  <div className={styles.trilhaInfo}>
                    {trilha.thumbnail && (
                      <img src={trilha.thumbnail} alt={trilha.title} />
                    )}
                    <div>
                      <h3>{trilha.title}</h3>
                      <p>{trilha.description}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.col3}>
                  <span className={`${styles.badge} ${styles[trilha.level]}`}>
                    {trilha.level}
                  </span>
                </div>
                <div className={styles.col4}>{trilha.duration}h</div>
                <div className={styles.col5}>{trilha.totalInscricoes}</div>
                <div className={styles.col6}>
                  {trilha.rating ? `⭐ ${trilha.rating}` : '-'}
                </div>
                <div className={styles.col7}>
                  <div className={styles.actions}>
                    <button 
                      className={styles.editBtn} 
                      title="Editar"
                      onClick={() => handleEdit(trilha)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(trilha.id, trilha.title)}
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{isCreating ? 'Nova Trilha' : 'Editar Trilha'}</h2>
            
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Imagem da Trilha</label>
                <div className={styles.imageUpload}>
                  {imagePreview ? (
                    <div className={styles.imagePreviewContainer}>
                      <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                      <button 
                        type="button"
                        className={styles.removeImageBtn}
                        onClick={() => {
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, thumbnail: '' }));
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <label className={styles.uploadLabel}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={styles.fileInput}
                      />
                      <div className={styles.uploadPlaceholder}>
                        <FaPlus />
                        <span>Clique para adicionar uma imagem</span>
                      </div>
                    </label>
                  )}
                </div>
            </div>

            <div className={styles.formGroup}>
              <label>Título</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Digite o título da trilha"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Descrição</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Digite a descrição"
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mentor</label>
              <select
                name="mentorId"
                value={formData.mentorId}
                onChange={handleInputChange}
                aria-label="Mentor da trilha"
              >
                <option value="">Selecione um mentor</option>
                {mentores.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Duração (horas)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="Ex: 40"
                  min="1"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Nível</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  aria-label="Nível da trilha"
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Categoria</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                aria-label="Categoria da trilha"
              >
                <option value="">Selecione uma categoria</option>
                <option value="Desenvolvimento Web">Desenvolvimento Web</option>
                <option value="Mobile">Mobile</option>
                <option value="Backend">Backend</option>
                <option value="Frontend">Frontend</option>
                <option value="DevOps">DevOps</option>
                <option value="Cloud">Cloud</option>
                <option value="Dados">Dados</option>
                <option value="IA e Machine Learning">IA e Machine Learning</option>
                <option value="Segurança">Segurança</option>
                <option value="UX/UI Design">UX/UI Design</option>
                <option value="Gestão de Projetos">Gestão de Projetos</option>
                <option value="Soft Skills">Soft Skills</option>
              </select>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button 
              className={styles.cancelBtn}
              onClick={() => {
                setShowEditModal(false);
                setIsCreating(false);
              }}
            >
              Cancelar
            </button>
            <button 
              className={styles.saveBtn}
              onClick={handleModalSave}
            >
              {isCreating ? 'Criar Trilha' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default AdminTrilhas;
