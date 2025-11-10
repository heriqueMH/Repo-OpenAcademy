# API de Dados do Dashboard - Especificação Completa

## 📋 Sumário
Este documento descreve a estrutura de dados e endpoints da API para o Dashboard do Portal de Trilhas Educacionais.

---

## 🎯 Estrutura de Dados

### 1. Dashboard Stats (Estatísticas Gerais)

**Endpoint:** `GET /dashboard-stats/:userId`

**Resposta:**
```json
{
  "id": "1",
  "userId": "1",
  "trilhasInscritas": 5,
  "trilhasConcluidas": 2,
  "horasEstudadas": 47,
  "certificados": 2,
  "sequenciaDias": 12,
  "pontos": 1850,
  "nivel": "Intermediário",
  "proximoNivel": 2500,
  "lastAccessDate": "2025-11-04T10:00:00.000Z"
}
```

**Campos:**
- `trilhasInscritas`: Total de trilhas em que o usuário está inscrito
- `trilhasConcluidas`: Total de trilhas finalizadas com certificado
- `horasEstudadas`: Tempo total de estudo acumulado
- `certificados`: Número de certificados obtidos
- `sequenciaDias`: Dias consecutivos de estudo
- `pontos`: Pontos XP acumulados
- `nivel`: Nível atual (Iniciante, Intermediário, Avançado)
- `proximoNivel`: Pontos necessários para próximo nível
- `lastAccessDate`: Data do último acesso (para cálculo de sequência)

---

### 2. Trilhas em Progresso

**Endpoint:** `GET /user-progress?userId=:userId`

**Resposta:**
```json
[
  {
    "id": "1",
    "userId": "1",
    "inscricaoId": "1",
    "trilhaId": "1",
    "titulo": "Foundation IOS",
    "thumbnail": "/inscricoes_capa_foundation_ios.png",
    "progresso": 65,
    "ultimaAula": "SwiftUI Basics",
    "proximaAula": "React Hooks Avançados",
    "tempoRestante": "8h 30min",
    "dataUltimoAcesso": "2025-11-03T14:30:00.000Z",
    "totalModulos": 12,
    "modulosConcluidos": 8
  }
]
```

**Campos:**
- `inscricaoId`: ID da inscrição do usuário
- `trilhaId`: ID da trilha
- `titulo`: Nome da trilha
- `thumbnail`: URL da imagem de capa
- `progresso`: Percentual de conclusão (0-100)
- `ultimaAula`: Última aula acessada
- `proximaAula`: Próxima aula a ser cursada
- `tempoRestante`: Tempo estimado para conclusão
- `dataUltimoAcesso`: Data/hora do último acesso
- `totalModulos`: Total de módulos da trilha
- `modulosConcluidos`: Módulos já finalizados

---

### 3. Atividades Recentes

**Endpoint:** `GET /activities?userId=:userId&_limit=10&_sort=timestamp&_order=desc`

**Resposta:**
```json
[
  {
    "id": "1",
    "userId": "1",
    "tipo": "conclusao",
    "titulo": "Módulo Concluído",
    "descricao": "Concluiu o módulo 'JavaScript ES6'",
    "trilhaId": "1",
    "trilhaTitulo": "Foundation IOS",
    "timestamp": "2025-11-04T08:00:00.000Z",
    "metadata": {
      "progresso": 65,
      "nota": 9.5
    }
  },
  {
    "id": "2",
    "userId": "1",
    "tipo": "certificado",
    "titulo": "Certificado Obtido",
    "descricao": "Recebeu certificado de 'HTML & CSS Avançado'",
    "trilhaId": "2",
    "trilhaTitulo": "Foudation Design",
    "timestamp": "2025-11-03T10:30:00.000Z",
    "metadata": {
      "certificadoUrl": "/certificados/html-css-avancado.pdf"
    }
  }
]
```

**Tipos de Atividades:**
- `conclusao`: Conclusão de módulo/aula
- `certificado`: Obtenção de certificado
- `inscricao`: Nova inscrição em trilha
- `conquista`: Desbloqueio de badge
- `badge`: Conquista de emblema

**Campos:**
- `tipo`: Tipo da atividade (ver tipos acima)
- `titulo`: Título resumido da atividade
- `descricao`: Descrição detalhada
- `trilhaId`: ID da trilha relacionada (opcional)
- `trilhaTitulo`: Nome da trilha (opcional)
- `timestamp`: Data/hora da atividade
- `metadata`: Dados adicionais específicos do tipo

---

### 4. Badges e Conquistas

**Endpoint:** `GET /user-badges?userId=:userId`

**Resposta:**
```json
[
  {
    "id": "1",
    "userId": "1",
    "badgeId": "primeira-trilha",
    "nome": "Primeira Trilha",
    "descricao": "Complete sua primeira trilha educacional",
    "icone": "🎓",
    "categoria": "conclusao",
    "conquistado": true,
    "dataConquista": "2025-10-15T10:00:00.000Z",
    "criterio": "Completar 1 trilha"
  },
  {
    "id": "3",
    "userId": "1",
    "badgeId": "mestre-conhecimento",
    "nome": "Mestre do Conhecimento",
    "descricao": "Complete 5 trilhas educacionais",
    "icone": "🏆",
    "categoria": "conclusao",
    "conquistado": false,
    "progresso": 40,
    "criterio": "Completar 5 trilhas"
  }
]
```

**Categorias de Badges:**
- `engajamento`: Relacionados a frequência e dedicação
- `conhecimento`: Relacionados a desempenho em avaliações
- `conclusao`: Relacionados a finalização de trilhas
- `especial`: Eventos especiais ou conquistas raras

**Campos:**
- `badgeId`: ID único do badge
- `nome`: Nome do badge
- `descricao`: Descrição da conquista
- `icone`: Emoji ou URL do ícone
- `categoria`: Categoria do badge
- `conquistado`: Se foi desbloqueado ou não
- `dataConquista`: Data de desbloqueio (se conquistado)
- `progresso`: Progresso até desbloquear (0-100, se não conquistado)
- `criterio`: Descrição do critério para conquistar

---

## 🔄 Endpoints de Escrita

### 5. Registrar Atividade

**Endpoint:** `POST /activities`

**Body:**
```json
{
  "userId": "1",
  "tipo": "conclusao",
  "titulo": "Módulo Concluído",
  "descricao": "Concluiu o módulo 'React Básico'",
  "trilhaId": "1",
  "trilhaTitulo": "Foundation IOS",
  "metadata": {
    "progresso": 70,
    "nota": 8.5
  }
}
```

**Resposta:** Objeto da atividade criada com `id` e `timestamp` gerados.

---

### 6. Atualizar Sequência de Dias

**Endpoint:** `PATCH /dashboard-stats/:userId`

**Body:**
```json
{
  "lastAccessDate": "2025-11-04T10:00:00.000Z"
}
```

**Lógica no Backend:**
- Se `lastAccessDate` for ontem, incrementa `sequenciaDias`
- Se for hoje, mantém `sequenciaDias`
- Se for antes de ontem, reseta para 1

---

### 7. Atualizar Progresso da Trilha

**Endpoint:** `PATCH /user-progress/:id`

**Body:**
```json
{
  "progresso": 75,
  "modulosConcluidos": 9,
  "ultimaAula": "Componentes React",
  "proximaAula": "Hooks Avançados",
  "dataUltimoAcesso": "2025-11-04T15:00:00.000Z"
}
```

---

## 📊 Endpoint Consolidado (Recomendado)

### 8. Dashboard Completo

**Endpoint:** `GET /dashboard/:userId`

**Resposta Combinada:**
```json
{
  "stats": {
    "trilhasInscritas": 5,
    "trilhasConcluidas": 2,
    "horasEstudadas": 47,
    // ... outros campos de stats
  },
  "trilhasEmProgresso": [
    {
      "id": "1",
      "titulo": "Foundation IOS",
      // ... dados da trilha
    }
  ],
  "atividadesRecentes": [
    {
      "id": "1",
      "tipo": "conclusao",
      // ... dados da atividade
    }
  ],
  "conquistasBadges": [
    {
      "id": "1",
      "nome": "Primeira Trilha",
      // ... dados do badge
    }
  ]
}
```

**Implementação no Backend:**
Agregar dados de múltiplos endpoints em uma única resposta otimizada.

---

## 🎯 Níveis e Pontuação

### Sistema de Níveis

```javascript
const NIVEIS = {
  'Iniciante': { min: 0, max: 999 },
  'Intermediário': { min: 1000, max: 2499 },
  'Avançado': { min: 2500, max: 4999 },
  'Expert': { min: 5000, max: 9999 },
  'Mestre': { min: 10000, max: Infinity }
};
```

### Distribuição de Pontos

- Conclusão de aula: 50 pontos
- Conclusão de módulo: 200 pontos
- Conclusão de trilha: 1000 pontos
- Obtenção de certificado: 500 pontos
- Sequência de 7 dias: 300 pontos
- Sequência de 30 dias: 1500 pontos
- Badge especial: 250-750 pontos

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação via JWT:

```
Authorization: Bearer <token>
```

O `userId` é extraído do token para garantir que usuários acessem apenas seus próprios dados.

---

## 📝 Notas de Implementação

1. **Cache:** Implementar cache de 5 minutos para `/dashboard/:userId`
2. **Paginação:** Atividades podem ser paginadas com `_page` e `_limit`
3. **Filtros:** Atividades podem ser filtradas por tipo: `?tipo=certificado`
4. **Sorting:** Usar `_sort` e `_order` para ordenação personalizada
5. **Real-time:** Considerar WebSockets para atualizações em tempo real de stats

---

## 🚀 Exemplo de Uso no Frontend

```typescript
import { getDashboardData } from './services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      const dashboardData = await getDashboardData(user.id);
      setData(dashboardData);
    };
    loadData();
  }, [user.id]);

  return (
    // Renderizar componentes com data.stats, data.trilhasEmProgresso, etc.
  );
};
```

---

## 📚 Referências Rápidas

### JSON Server Queries
- Filtro: `?userId=1`
- Limite: `?_limit=10`
- Ordenação: `?_sort=timestamp&_order=desc`
- Paginação: `?_page=1&_limit=20`
- Busca: `?q=javascript`

### Rotas do JSON Server
- `GET /dashboard-stats` - Lista todos
- `GET /dashboard-stats/:id` - Item específico
- `POST /dashboard-stats` - Criar novo
- `PATCH /dashboard-stats/:id` - Atualizar parcial
- `PUT /dashboard-stats/:id` - Atualizar completo
- `DELETE /dashboard-stats/:id` - Deletar
