# Atualização do Sistema de Turmas

## Data: 6 de novembro de 2025

## Alterações Implementadas

### 1. Tipos Atualizados (src/types/turma.types.ts)

#### Novo tipo: ModalidadeTurma
```typescript
export type ModalidadeTurma = 'presencial' | 'hibrida' | 'ead-sincrono' | 'ead-assincrono';
```

#### Interface Turma atualizada
- **modalidade** (obrigatório): Define se a turma é presencial, híbrida, EAD síncrono ou EAD assíncrono
- **location** (opcional): Obrigatório apenas para turmas presenciais e híbridas
- **mentorId** (opcional): Obrigatório apenas para turmas que NÃO sejam EAD assíncrono
- **horario** (opcional): Campo de texto livre para horário das aulas
- **startDate/endDate**: Agora armazenam apenas DATA (sem hora)

### 2. Formulário de Turmas (TurmaFormModal.tsx)

#### Campos do formulário:
1. **Nome da Turma** - obrigatório
2. **Modalidade** - obrigatório (presencial/híbrida/EAD síncrono/EAD assíncrono)
3. **Status** - obrigatório (planejada/inscrições abertas/em andamento/concluída)
4. **Mentor** - obrigatório apenas se modalidade != EAD assíncrono (campo oculto para EAD assíncrono)
5. **Localização** - obrigatório apenas para presencial e híbrida (campo oculto para EAD)
6. **Horário das Aulas** - opcional/recomendado (texto livre)
7. **Data de Início** - obrigatório (apenas data, sem hora)
8. **Data de Término** - obrigatório (apenas data, sem hora)
9. **Capacidade Máxima** - obrigatório (número)

#### Validações implementadas:
- ✅ Nome, datas e capacidade sempre obrigatórios
- ✅ Mentor obrigatório apenas se modalidade != EAD assíncrono
- ✅ Localização obrigatória apenas para presencial e híbrida
- ✅ Data de término deve ser posterior à data de início
- ✅ Capacidade mínima de 1 aluno

#### Lógica condicional:
- Se modalidade = **EAD assíncrono**: campo Mentor não é exibido
- Se modalidade = **EAD síncrono ou assíncrono**: campo Localização não é exibido
- Se modalidade = **presencial ou híbrida**: campos Mentor e Localização são obrigatórios

### 3. Visualização de Turmas (CoordinatorTrilhas.tsx)

#### Informações exibidas:
- Nome da turma
- Status (badge colorido)
- **Modalidade** (novo)
- Mentor (se existir)
- Localização (se existir)
- **Horário** (novo, se existir)
- Data de início (sem hora)
- Data de término (sem hora)
- Capacidade (inscritos/máximo)

#### Função auxiliar nova:
```typescript
getModalidadeLabel(modalidade: string) => string
```
Converte valores internos para labels amigáveis:
- 'presencial' → 'Presencial'
- 'hibrida' → 'Híbrida'
- 'ead-sincrono' → 'EAD Síncrono'
- 'ead-assincrono' → 'EAD Assíncrono'

### 4. Banco de Dados Atualizado (db.json)

#### Turmas de exemplo:
- **t1**: Presencial com local e horário
- **t2**: Híbrida com local e horário
- **t3**: Presencial com local e horário
- **t4**: EAD Síncrono (sem local, com mentor e horário)
- **t5**: Híbrida com local e horário
- **t6**: EAD Assíncrono (sem local, sem mentor, sem horário)

#### Formato de datas:
Antes: `"2025-11-15T09:00:00.000Z"` (com hora)
Agora: `"2025-11-15T00:00:00.000Z"` (apenas data, hora zerada)

## Casos de Uso

### Caso 1: Turma Presencial
```json
{
  "modalidade": "presencial",
  "mentorId": "3",
  "location": "Sala 201 - Prédio A, Campus Higienópolis",
  "horario": "Terças e Quintas, 19h às 22h"
}
```

### Caso 2: Turma Híbrida
```json
{
  "modalidade": "hibrida",
  "mentorId": "3",
  "location": "Sala 306 - Prédio C",
  "horario": "Segundas (presencial) e Quintas (online), 14h às 18h"
}
```

### Caso 3: Turma EAD Síncrono
```json
{
  "modalidade": "ead-sincrono",
  "mentorId": "3",
  "horario": "Terças, 19h às 22h (ao vivo)"
  // location não é obrigatório nem exibido
}
```

### Caso 4: Turma EAD Assíncrono (Autoinstrucional)
```json
{
  "modalidade": "ead-assincrono"
  // mentorId não é obrigatório nem exibido
  // location não é obrigatório nem exibido
  // horario é opcional (geralmente não usado)
}
```

## Impacto nas Telas

### Tela de Criação/Edição de Turmas
- Campos mostram/escondem conforme modalidade selecionada
- Validações ajustam-se automaticamente
- Input de data sem seletor de hora

### Tela de Visualização de Turmas
- Exibe apenas campos que estão preenchidos
- Formato de data brasileiro sem hora
- Nova linha para modalidade

## Retrocompatibilidade

⚠️ **Atenção**: Turmas antigas no banco de dados DEVEM ser atualizadas para incluir o campo `modalidade`. Turmas sem esse campo podem causar erros.

## Próximos Passos (Sugestões)

1. Adicionar filtro por modalidade na listagem de turmas
2. Relatórios separados por modalidade
3. Configurações específicas por modalidade (ex: link de sala virtual para EAD)
4. Validação de conflitos de horário para turmas presenciais/híbridas
