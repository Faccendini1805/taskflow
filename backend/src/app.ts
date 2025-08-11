// src/app.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './modules/auth/auth.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import { logger } from './config/logger';

// Middlewares propios
import { errorHandler } from './middlewares/errorHandler';
import { authGuard } from './middlewares/authGuard';
// import { validateRequest } from './middlewares/validateRequest'; // úsalo por ruta cuando lo necesites

const app = express();

/* ----------------------- Middlewares base ----------------------- */
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger HTTP (solo en dev; los logs de app van con Pino)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ------------------------ Healthcheck -------------------------- */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

/* -------------------------- Rutas ------------------------------ */
// Auth (ej.: /api/auth/register, /api/auth/login, /api/auth/me)
app.use('/api/auth', authRoutes);

// Tasks API routes
app.use('/api/tasks', tasksRoutes);

// Ejemplo de ruta protegida por rol (ADMIN)
app.get('/api/admin/ping', authGuard(['ADMIN']), (_req, res) => {
  res.json({ ok: true, roleRequired: 'ADMIN' });
});

// Ejemplo: cuando definas rutas con validación, úsalo así:
// import { z } from 'zod';
// const createTaskSchema = z.object({ title: z.string().min(1) });
// app.post('/api/tasks', authGuard(['ADMIN','SUPERVISOR','AGENT']), validateRequest({ body: createTaskSchema }), tasksController.create);

/* --------------------- 404 y Error Handler --------------------- */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler); // centralizado, último middleware

export default app;
