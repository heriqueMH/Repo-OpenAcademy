import { Router, Request, Response } from 'express';
import { Database } from '../database';

const router = Router();

// GET /api/trilhas
router.get('/', (req: Request, res: Response) => {
  const { category, level } = req.query;
  
  let trilhas = Database.getAll('trilhas');
  
  if (category) {
    trilhas = Database.query('trilhas', (trilha) => trilha.category === category);
  }
  
  if (level) {
    trilhas = Database.query('trilhas', (trilha) => trilha.level === level);
  }
  
  res.json(trilhas);
});

// GET /api/trilhas/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const trilha = Database.getById('trilhas', id);
  
  if (!trilha) {
    return res.status(404).json({ error: 'Trilha not found' });
  }
  
  res.json(trilha);
});

// POST /api/trilhas
router.post('/', (req: Request, res: Response) => {
  const trilhaData = {
    id: Date.now().toString(),
    enrolledCount: 0,
    rating: 0,
    ...req.body
  };
  
  const trilha = Database.create('trilhas', trilhaData);
  res.status(201).json(trilha);
});

// PATCH /api/trilhas/:id
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const trilha = Database.update('trilhas', id, updates);
  
  if (!trilha) {
    return res.status(404).json({ error: 'Trilha not found' });
  }
  
  res.json(trilha);
});

// DELETE /api/trilhas/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = Database.delete('trilhas', id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Trilha not found' });
  }
  
  res.status(204).send();
});

export { router as trilhasRouter };
