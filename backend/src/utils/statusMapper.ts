import { Status } from '@prisma/client';

/**
 * Mapea estados externos (de sistemas terceros) a nuestros enums internos de Prisma
 */
const statusMap: Record<string, Status> = {
  // Ejemplos de mapeo (normalizá a minúsculas)
  pendiente: 'PENDIENTE',
  en_proceso: 'EN_PROCESO',
  finalizado: 'COMPLETADO',
  cancelado: 'CANCELADO',
  // variantes comunes
  open: 'PENDIENTE',
  in_progress: 'EN_PROCESO',
  done: 'COMPLETADO',
  closed: 'CANCELADO'
};

/**
 * Recibe un estado externo y devuelve el equivalente interno
 */
export function mapExternalStatus(external: string): Status {
  const key = external.trim().toLowerCase();
  return statusMap[key] ?? 'PENDIENTE';
}

/**
 * Devuelve todos los estados externos soportados
 */
export function getSupportedExternalStatuses(): string[] {
  return Object.keys(statusMap);
}
