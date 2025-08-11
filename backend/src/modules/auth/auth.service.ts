import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export type JwtPayload = { sub: number; role: string; email: string };

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  static async register(input: {
    email: string;
    password: string;
    name?: string;
    role?: 'ADMIN' | 'SUPERVISOR' | 'AGENT' | 'AUDITOR';
  }) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) {
      logger.warn({ email: input.email }, 'Intento de registro con email ya existente');
      throw new Error('El email ya está registrado');
    }

    const hashed = await bcrypt.hash(input.password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashed,
        role: input.role ?? 'AGENT',
        agent: input.name
          ? {
              create: {
                name: input.name,
                email: input.email
              }
            }
          : undefined
      },
      include: { agent: true }
    });

    const token = this.signToken({ sub: user.id, role: user.role, email: user.email });
    return { user: this.sanitize(user), token };
  }

  static async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { agent: true }
    });

    if (!user) {
      logger.warn({ email: input.email }, 'Login con email inexistente');
      throw new Error('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(input.password, user.password);
    if (!ok) {
      logger.warn({ email: input.email }, 'Login con contraseña inválida');
      throw new Error('Credenciales inválidas');
    }

    const token = this.signToken({ sub: user.id, role: user.role, email: user.email });
    return { user: this.sanitize(user), token };
  }

  static signToken(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '8h' });
  }

  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  private static sanitize<T extends { password?: string }>(obj: T) {
    const { password, ...safe } = obj;
    return safe;
  }
}
