import { Router, Request, Response } from 'express';
import { Database } from '../database';
import { User } from '../types';

const router = Router();

// GET /api/users
router.get('/', (req: Request, res: Response) => {
  const { email, role } = req.query;
  
  let users = Database.getAll('users');
  
  if (email) {
    users = Database.query('users', (user) => user.email === email);
  }
  
  if (role) {
    users = Database.query('users', (user) => user.role === role);
  }
  
  res.json(users);
});

// GET /api/users/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = Database.getById('users', id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// POST /api/users
router.post('/', (req: Request, res: Response) => {
  const userData: User = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    isVerified: false,
    role: 'student',
    ...req.body
  };
  
  const user = Database.create('users', userData);
  res.status(201).json(user);
});

// PATCH /api/users/:id
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const user = Database.update('users', id, updates);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// DELETE /api/users/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = Database.delete('users', id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.status(204).send();
});

export { router as usersRouter };
