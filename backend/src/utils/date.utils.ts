/**
 * Utilidades para manejo de fechas
 */

export function formatDate(date: Date | string | null, locale = 'es-AR'): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  export function formatDateTime(date: Date | string | null, locale = 'es-AR'): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  export function toISO(date: Date | string | null): string | null {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
  }
  
  export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  export function diffInDays(from: Date | string, to: Date | string): number {
    const d1 = typeof from === 'string' ? new Date(from) : from;
    const d2 = typeof to === 'string' ? new Date(to) : to;
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }
  