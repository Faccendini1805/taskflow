import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const router = Router();

/**
 * Middleware simple de autenticación por Bearer JWT.
 * Si ya tenés un authGuard global, podés reemplazar esto por tu import.
 */
function authGuard(req: Request & { user?: any }, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'Token no provisto' });
    const payload = AuthService.verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Rutas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authGuard, AuthController.me);

export default router;
