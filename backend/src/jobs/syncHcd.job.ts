// jobs/syncHcd.job.ts
import { prisma } from '../src/config/db';
import { logger } from '../src/config/logger';

/**
 * Sincroniza tickets desde HCD y actualiza en DB local.
 * Podría correr cada X minutos con un cron.
 */
export const syncHcdJob = async () => {
  logger.info('[syncHcd.job] Iniciando sincronización con HCD...');

  try {
    // Ejemplo: llamada a API externa (a reemplazar por tu integración real)
    const hcdTickets = await fetch('https://hcd.example.com/api/tickets')
      .then((res) => res.json());

    let countUpdated = 0;
    let countInserted = 0;

    for (const ticket of hcdTickets) {
      const existing = await prisma.ticket.findUnique({
        where: { externalId: ticket.id },
      });

      if (existing) {
        await prisma.ticket.update({
          where: { id: existing.id },
          data: {
            status: ticket.status,
            title: ticket.title,
            updatedAt: new Date(ticket.updated_at),
          },
        });
        countUpdated++;
      } else {
        await prisma.ticket.create({
          data: {
            externalId: ticket.id,
            title: ticket.title,
            description: ticket.description || '',
            status: ticket.status,
            createdAt: new Date(ticket.created_at),
          },
        });
        countInserted++;
      }
    }

    logger.info(
      `[syncHcd.job] Sincronización completada. Insertados: ${countInserted}, Actualizados: ${countUpdated}`
    );
  } catch (err) {
    logger.error({ err }, '[syncHcd.job] Error en la sincronización');
  }
};

// Si quieres ejecutarlo directamente (node jobs/syncHcd.job.ts)
if (import.meta.url === `file://${process.argv[1]}`) {
  syncHcdJob().finally(() => process.exit(0));
}
