import { Router, Request, Response } from 'express';
import { Database } from '../database';
import { TurmaInscription } from '../types';

const router = Router();

// GET /api/turma-inscriptions
router.get('/', (req: Request, res: Response) => {
  const { userId, turmaId, status } = req.query;
  
  let inscriptions = Database.getAll('turma-inscriptions');
  
  if (userId) {
    inscriptions = Database.query('turma-inscriptions', (insc) => insc.userId === userId);
  }
  
  if (turmaId) {
    inscriptions = Database.query('turma-inscriptions', (insc) => insc.turmaId === turmaId);
  }
  
  if (status) {
    inscriptions = Database.query('turma-inscriptions', (insc) => insc.status === status);
  }
  
  res.json(inscriptions);
});

// GET /api/turma-inscriptions/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const inscription = Database.getById('turma-inscriptions', id);
  
  if (!inscription) {
    return res.status(404).json({ error: 'Inscription not found' });
  }
  
  res.json(inscription);
});

// POST /api/turma-inscriptions
router.post('/', (req: Request, res: Response) => {
  const inscriptionData: TurmaInscription = {
    id: Date.now().toString(),
    inscriptionDate: new Date().toISOString(),
    status: 'pending',
    progress: 0,
    attendance: 0,
    ...req.body
  };
  
  const inscription = Database.create('turma-inscriptions', inscriptionData);
  res.status(201).json(inscription);
});

// PATCH /api/turma-inscriptions/:id
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const inscription = Database.update('turma-inscriptions', id, updates);
  
  if (!inscription) {
    return res.status(404).json({ error: 'Inscription not found' });
  }
  
  res.json(inscription);
});

// DELETE /api/turma-inscriptions/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = Database.delete('turma-inscriptions', id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Inscription not found' });
  }
  
  res.status(204).send();
});

export { router as inscriptionsRouter };
