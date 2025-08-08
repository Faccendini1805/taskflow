const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;
const config = require('../config/env');

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  // Si hay metadatos, los convertimos a string
  if (Object.keys(meta).length > 0) {
    // Ocultamos información sensible
    const sanitizedMeta = { ...meta };
    if (sanitizedMeta.password) {
      sanitizedMeta.password = '***REDACTED***';
    }
    if (sanitizedMeta.token) {
      sanitizedMeta.token = '***REDACTED***';
    }
    log += `\n${JSON.stringify(sanitizedMeta, null, 2)}`;
  }
  
  return log;
});

// Configuración del logger
const logger = createLogger({
  level: config.logLevel || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    config.isProduction ? json() : combine(colorize(), logFormat)
  ),
  transports: [
    // Escribe todos los logs con nivel 'error' o inferior a 'error.log'
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Escribe todos los logs con nivel 'info' o inferior a 'combined.log'
    new transports.File({ filename: 'logs/combined.log' })
  ],
  // En producción, no salir después de manejar un error no manejado
  exitOnError: false
});

// Si no estamos en producción, también mostramos los logs en consola
if (!config.isProduction) {
  logger.add(new transports.Console({
    format: combine(colorize(), logFormat)
  }));
}

// Función para registrar errores de manera consistente
logger.logError = (message, error = {}, meta = {}) => {
  const { message: errorMessage, stack, ...errorProps } = error;
  
  logger.error(message, {
    ...meta,
    error: {
      message: errorMessage || 'Error desconocido',
      ...(stack && !config.isProduction ? { stack } : {}),
      ...errorProps
    }
  });
};

// Función para registrar información de depuración (solo en desarrollo)
logger.debugInfo = (message, meta = {}) => {
  if (!config.isProduction) {
    logger.debug(message, meta);
  }
};

// Manejador para excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.logError('Excepción no capturada', error);
  // No salir en desarrollo para permitir la depuración
  if (config.isProduction) process.exit(1);
});

// Manejador para promesas rechazadas no manejadas
process.on('unhandledRejection', (reason, promise) => {
  logger.logError('Promesa rechazada no manejada', reason);
  // No salir en desarrollo para permitir la depuración
  if (config.isProduction) process.exit(1);
});

module.exports = logger;
