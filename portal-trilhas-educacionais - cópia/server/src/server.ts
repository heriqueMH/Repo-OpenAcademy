import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Database } from './database';
import { routes } from './routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 25000;

// Middlewares
app.use(helmet()); // Segurança
app.use(compression()); // Compressão de respostas
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar banco de dados em memória
Database.initialize();

// Rotas
app.use('/api', routes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path
  });
});

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  🚀 Portal Trilhas Backend Server             ║
║                                                ║
║  📡 Running on: http://localhost:${PORT}       ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}            ║
║  📊 Database: In-Memory                        ║
╚════════════════════════════════════════════════╝
  `);
});

export default app;
