// src/lib/utils/formatDate.ts
export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions, locale = 'es-AR') {
    const d = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(opts ?? {})
    }).format(d);
  }
  
  export function formatDateTime(date: string | Date, locale = 'es-AR') {
    return formatDate(date, { hour: '2-digit', minute: '2-digit' }, locale);
  }
  