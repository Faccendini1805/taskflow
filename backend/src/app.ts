import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cron from 'node-cron';

import authRoutes from './modules/auth/auth.routes';
import { logger } from './config/logger';

// Jobs (asegurate de tenerlos en src/jobs/)
import { syncHcdJob } from './jobs/syncHcd.job';
import { notifyJob } from './jobs/notify.job';

const app = express();

/* ----------------------- Middlewares base ----------------------- */
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger HTTP (solo en dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ----------------------- Healthcheck ---------------------------- */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

/* ----------------------- Rutas API ------------------------------ */
app.use('/api/auth', authRoutes);

// (Hooks para más rutas en el futuro)
// app.use('/api/tasks', tasksRoutes);
// app.use('/api/areas', areasRoutes);

/* ----------------------- Cron Jobs ------------------------------ */
// CRON_SYNC_HCD: cada 10 min por defecto
const CRON_SYNC_HCD = process.env.CRON_SYNC_HCD || '*/10 * * * *';
// CRON_NOTIFY: cada 1 min por defecto
const CRON_NOTIFY = process.env.CRON_NOTIFY || '* * * * *';

try {
  cron.schedule(CRON_SYNC_HCD, async () => {
    logger.info({ cron: CRON_SYNC_HCD }, '[cron] Ejecutando syncHcdJob');
    await syncHcdJob();
  });

  cron.schedule(CRON_NOTIFY, async () => {
    logger.info({ cron: CRON_NOTIFY }, '[cron] Ejecutando notifyJob');
    await notifyJob();
  });

  logger.info({ CRON_SYNC_HCD, CRON_NOTIFY }, 'Cron jobs programados');
} catch (err) {
  logger.error({ err }, 'Error programando cron jobs');
}

/* ----------------------- 404 & Error Handler -------------------- */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(err?.status || 500).json({ error: err?.message || 'Internal Server Error' });
});

export default app;
