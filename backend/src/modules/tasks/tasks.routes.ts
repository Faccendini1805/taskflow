import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authGuard } from '../../middlewares/authGuard';
import { validateRequest } from '../../middlewares/validateRequest';
import { z } from 'zod';
import { MemberRole, Priority, Status } from '@prisma/client';

const router = Router();

// Schemas para validateRequest (evita duplicar los del controller si preferís centralizar)
const createSchema = z.object({
  expediente: z.string().min(1),
  description: z.string().min(1),
  areaId: z.number().int().optional(),
  priority: z.nativeEnum(Priority).optional(),
  ownerAgentId: z.number().int(),
  inventoryId: z.number().int().optional(),
  tags: z.array(z.number().int()).optional()
});

const updateSchema = z.object({
  description: z.string().min(1).optional(),
  areaId: z.number().int().nullable().optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  inventoryId: z.number().int().nullable().optional()
});

const statusSchema = z.object({
  newStatus: z.nativeEnum(Status),
  reason: z.string().max(300).optional()
});

const memberSchema = z.object({
  agentId: z.number().int(),
  role: z.nativeEnum(MemberRole)
});

// Listar (RBAC: cualquiera autenticado)
router.get('/', authGuard(['ADMIN', 'SUPERVISOR', 'AGENT', 'AUDITOR']), TasksController.list);

// Crear (owner = agentId provisto; normalmente ADMIN/SUPERVISOR)
router.post(
  '/',
  authGuard(['ADMIN', 'SUPERVISOR']),
  validateRequest({ body: createSchema }),
  TasksController.create
);

// Detalle
router.get('/:id', authGuard(['ADMIN', 'SUPERVISOR', 'AGENT', 'AUDITOR']), TasksController.getById);

// Update básicos
router.patch(
  '/:id',
  authGuard(['ADMIN', 'SUPERVISOR']),
  validateRequest({ body: updateSchema }),
  TasksController.updateBasics
);

// Cambio de estado
router.patch(
  '/:id/status',
  authGuard(['ADMIN', 'SUPERVISOR', 'AGENT']),
  validateRequest({ body: statusSchema }),
  TasksController.changeStatus
);

// Miembros: agregar / cambiar rol
router.patch(
  '/:id/members',
  authGuard(['ADMIN', 'SUPERVISOR']),
  validateRequest({ body: memberSchema }),
  TasksController.addMember
);

// Miembros: remover
router.delete(
  '/:id/members/:agentId',
  authGuard(['ADMIN', 'SUPERVISOR']),
  TasksController.removeMember
);

export default router;
