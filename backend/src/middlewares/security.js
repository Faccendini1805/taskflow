const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { body, validationResult } = require('express-validator');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos'
});

// Security headers
const securityHeaders = [
  helmet(),
  helmet.xssFilter(),
  helmet.noSniff(),
  helmet.hidePoweredBy(),
  helmet.frameguard({ action: 'deny' }),
  helmet.permittedCrossDomainPolicies(),
  helmet.referrerPolicy({ policy: 'same-origin' }),
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }),
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  })
];

// Input sanitization
const sanitizeInput = [
  // Sanitize request data
  (req, res, next) => {
    // Remove any keys that start with $
    const sanitize = (obj) => {
      if (!obj) return obj;
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          // Basic XSS protection
          obj[key] = xss(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    };
    
    sanitize(req.body);
    sanitize(req.params);
    sanitize(req.query);
    next();
  },
  
  // Sanitize mongo queries
  mongoSanitize(),
  
  // Remove any script tags from input
  (req, res, next) => {
    const sanitize = (obj) => {
      if (!obj) return obj;
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    };
    
    sanitize(req.body);
    sanitize(req.params);
    sanitize(req.query);
    next();
  }
];

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tudominio.com'] 
    : ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Security middleware for sensitive routes
const requireAuth = (req, res, next) => {
  // Add your authentication logic here
  // For example, check for a valid JWT token
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }
  
  // Verify token and attach user to request
  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.sendStatus(403);
  //   req.user = user;
  //   next();
  // });
  
  // For now, just call next()
  next();
};

module.exports = {
  limiter,
  securityHeaders,
  sanitizeInput,
  corsOptions,
  requireAuth
};
