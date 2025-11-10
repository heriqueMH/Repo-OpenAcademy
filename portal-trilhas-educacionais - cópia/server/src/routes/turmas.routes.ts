import { Router, Request, Response } from 'express';
import { Database } from '../database';

const router = Router();

// GET /api/turmas
router.get('/', (req: Request, res: Response) => {
  const { trilhaId, status, _expand } = req.query;
  
  let turmas = Database.getAll('turmas');
  
  if (trilhaId) {
    turmas = Database.query('turmas', (turma) => turma.trilhaId === trilhaId);
  }
  
  if (status) {
    turmas = Database.query('turmas', (turma) => turma.status === status);
  }
  
  // Expand trilha and mentor data
  if (_expand) {
    const expandFields = (typeof _expand === 'string' ? [_expand] : _expand) as string[];
    turmas = turmas.map((turma: any) => {
      const expandedTurma = { ...turma };
      
      if (expandFields.includes('trilha')) {
        expandedTurma.trilha = Database.getById('trilhas', turma.trilhaId);
      }
      
      if (expandFields.includes('mentor') && turma.mentorId) {
        expandedTurma.mentor = Database.getById('users', turma.mentorId);
      }
      
      return expandedTurma;
    });
  }
  
  res.json(turmas);
});

// GET /api/turmas/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { _expand } = req.query;
  
  let turma: any = Database.getById('turmas', id);
  
  if (!turma) {
    return res.status(404).json({ error: 'Turma not found' });
  }
  
  // Expand trilha and mentor data
  if (_expand) {
    const expandFields = (typeof _expand === 'string' ? [_expand] : _expand) as string[];
    turma = { ...turma };
    
    if (expandFields.includes('trilha')) {
      turma.trilha = Database.getById('trilhas', turma.trilhaId);
    }
    
    if (expandFields.includes('mentor') && turma.mentorId) {
      turma.mentor = Database.getById('users', turma.mentorId);
    }
  }
  
  res.json(turma);
});

// POST /api/turmas
router.post('/', (req: Request, res: Response) => {
  const turmaData = {
    id: Date.now().toString(),
    enrolledCount: 0,
    approvedCount: 0,
    createdAt: new Date().toISOString(),
    ...req.body
  };
  
  const turma = Database.create('turmas', turmaData);
  res.status(201).json(turma);
});

// PATCH /api/turmas/:id
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const turma = Database.update('turmas', id, updates);
  
  if (!turma) {
    return res.status(404).json({ error: 'Turma not found' });
  }
  
  res.json(turma);
});

// DELETE /api/turmas/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = Database.delete('turmas', id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Turma not found' });
  }
  
  res.status(204).send();
});

export { router as turmasRouter };
