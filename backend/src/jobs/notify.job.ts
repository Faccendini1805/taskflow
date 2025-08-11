// jobs/notify.job.ts
import { prisma } from '../src/config/db';
import { logger } from '../src/config/logger';

/**
 * Envía notificaciones pendientes (por email/chat) según la configuración de cada usuario.
 */
export const notifyJob = async () => {
  logger.info('[notify.job] Iniciando envío de notificaciones...');

  try {
    const pending = await prisma.notification.findMany({
      where: { sent: false },
      include: { user: true },
    });

    let sentCount = 0;

    for (const notif of pending) {
      try {
        // Ejemplo de envío por email (reemplazar con nodemailer, SendGrid, etc.)
        if (notif.type === 'EMAIL') {
          logger.info(`[notify.job] Enviando email a ${notif.user.email} - ${notif.message}`);
          // await emailService.send(notif.user.email, notif.message);
        }

        // Ejemplo de envío por chat interno o bot
        if (notif.type === 'CHAT') {
          logger.info(`[notify.job] Enviando chat a ${notif.user.name} - ${notif.message}`);
          // await chatService.send(notif.user.id, notif.message);
        }

        await prisma.notification.update({
          where: { id: notif.id },
          data: { sent: true, sentAt: new Date() },
        });

        sentCount++;
      } catch (err) {
        logger.error({ err, notifId: notif.id }, '[notify.job] Error enviando notificación');
      }
    }

    logger.info(`[notify.job] Notificaciones enviadas: ${sentCount}`);
  } catch (err) {
    logger.error({ err }, '[notify.job] Error general en notificaciones');
  }
};

// Ejecución directa
if (import.meta.url === `file://${process.argv[1]}`) {
  notifyJob().finally(() => process.exit(0));
}
