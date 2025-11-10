import { Router, Request, Response } from 'express';
import { Database } from '../database';
import { Certificate } from '../types';

const router = Router();

// GET /api/certificates
router.get('/', (req: Request, res: Response) => {
  const { userId } = req.query;
  
  let certificates = Database.getAll('certificates');
  
  if (userId) {
    certificates = Database.query('certificates', (cert) => cert.userId === userId);
  }
  
  res.json(certificates);
});

// GET /api/certificates/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const certificate = Database.getById('certificates', id);
  
  if (!certificate) {
    return res.status(404).json({ error: 'Certificate not found' });
  }
  
  res.json(certificate);
});

// POST /api/certificates
router.post('/', (req: Request, res: Response) => {
  const certificateData: Certificate = {
    id: Date.now().toString(),
    issuedAt: new Date().toISOString(),
    certificateNumber: `CERT-${Date.now()}`,
    ...req.body
  };
  
  const certificate = Database.create('certificates', certificateData);
  res.status(201).json(certificate);
});

// DELETE /api/certificates/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = Database.delete('certificates', id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Certificate not found' });
  }
  
  res.status(204).send();
});

export { router as certificatesRouter };
