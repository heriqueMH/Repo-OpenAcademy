import { Router } from 'express';
import { usersRouter } from './users.routes';
import { trilhasRouter } from './trilhas.routes';
import { turmasRouter } from './turmas.routes';
import { inscriptionsRouter } from './inscriptions.routes';
import { certificatesRouter } from './certificates.routes';

const router = Router();

router.use('/users', usersRouter);
router.use('/trilhas', trilhasRouter);
router.use('/turmas', turmasRouter);
router.use('/turma-inscriptions', inscriptionsRouter);
router.use('/certificates', certificatesRouter);

export { router as routes };
