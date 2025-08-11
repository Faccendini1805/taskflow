import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/db';
import detect from 'detect-port';

const server = http.createServer(app);

// Arranque con detección de puerto disponible
(async () => {
  try {
    const requestedPort = env.PORT || 3000;        // env.PORT ya es number por Zod
    const freePort = await detect(requestedPort);  // si requestedPort está ocupado, te da el siguiente libre

    if (freePort !== requestedPort) {
      logger.warn(
        { requestedPort, freePort },
        `Puerto ${requestedPort} ocupado. Usando ${freePort}.`
      );
    }

    // Opcional: exponer el puerto elegido al resto de la app
    process.env.PORT = String(freePort);

    server.listen(freePort, async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        logger.info('Conexión a DB OK');
      } catch (err) {
        logger.error({ err }, 'Fallo conectando a la DB');
      }
      logger.info(`Servidor escuchando en http://localhost:${freePort}`);
    });
  } catch (err) {
    logger.error({ err }, 'Error al detectar puerto disponible');
    process.exit(1);
  }
})();

// Manejo explícito de errores del servidor
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    logger.error({ err }, `Puerto en uso (EADDRINUSE).`);
  } else {
    logger.error({ err }, 'Error del servidor no controlado');
  }
  process.exit(1);
});

// Cierre elegante
const shutdown = async (signal: string) => {
  logger.warn({ signal }, 'Recibida señal, cerrando servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Servidor y DB cerrados. Bye!');
    process.exit(0);
  });
};
['SIGINT', 'SIGTERM'].forEach((s) => process.on(s as NodeJS.Signals, () => shutdown(s)));
