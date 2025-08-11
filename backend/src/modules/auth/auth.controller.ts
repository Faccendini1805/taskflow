import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { logger } from '../../config/logger';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'AGENT', 'AUDITOR']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const AuthController = {
  register: async (req: Request, res: Response) => {
    try {
      const input = registerSchema.parse(req.body);
      const { user, token } = await AuthService.register(input);
      return res.status(201).json({ user, token });
    } catch (err: any) {
      logger.error({ err }, 'Error en registro');
      const message = err?.issues?.[0]?.message || err.message || 'Error al registrar';
      return res.status(400).json({ error: message });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const input = loginSchema.parse(req.body);
      const { user, token } = await AuthService.login(input);
      return res.status(200).json({ user, token });
    } catch (err: any) {
      logger.error({ err }, 'Error en login');
      const message = err?.issues?.[0]?.message || err.message || 'Error al iniciar sesión';
      return res.status(401).json({ error: message });
    }
  },

  me: async (req: Request & { user?: { id: number; email: string; role: string } }, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'No autorizado' });
      // En un caso real, podrías refrescar datos desde DB si querés
      return res.json({ user: req.user });
    } catch (err: any) {
      logger.error({ err }, 'Error en /me');
      return res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }
};
