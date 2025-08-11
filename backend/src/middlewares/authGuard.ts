import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/db';

export const authGuard = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: number };

      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      (req as any).user = user;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
};
