import { Request, Response } from 'express';
import { z } from 'zod';
import { TasksService } from './tasks.service';
import { MemberRole, Priority, Status } from '@prisma/client';

const createSchema = z.object({
  expediente: z.string().min(1),
  description: z.string().min(1),
  areaId: z.number().int().optional(),
  priority: z.nativeEnum(Priority).optional(),
  ownerAgentId: z.number().int(),
  inventoryId: z.number().int().optional(),
  tags: z.array(z.number().int()).optional()
});

const listSchema = z.object({
  status: z.nativeEnum(Status).optional(),
  areaId: z.coerce.number().int().optional(),
  priority: z.nativeEnum(Priority).optional(),
  ownerAgentId: z.coerce.number().int().optional(),
  collabAgentId: z.coerce.number().int().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
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

export class TasksController {
  static async create(req: Request, res: Response) {
    const body = createSchema.parse(req.body);
    const service = new TasksService();
    const task = await service.create(body);
    res.status(201).json(task);
  }

  static async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const service = new TasksService();
    const task = await service.get(id);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  }

  static async list(req: Request, res: Response) {
    const query = listSchema.parse(req.query);
    const service = new TasksService();
    const tasks = await service.list(query);
    res.json(tasks);
  }

  static async updateBasics(req: Request, res: Response) {
    const id = Number(req.params.id);
    const body = updateSchema.parse(req.body);
    const service = new TasksService();
    const task = await service.updateBasics(id, {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : body.dueDate ?? undefined
    });
    res.json(task);
  }

  static async changeStatus(req: Request & { user?: any }, res: Response) {
    const id = Number(req.params.id);
    const { newStatus, reason } = statusSchema.parse(req.body);
    const service = new TasksService();
    const agentId = req.user?.agent?.id || undefined; // si adjuntas agent en authGuard
    const task = await service.changeStatus(id, newStatus, reason, agentId);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  }

  static async addMember(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { agentId, role } = memberSchema.parse(req.body);
    const service = new TasksService();
    const task = await service.addMember(id, agentId, role);
    res.json(task);
  }

  static async removeMember(req: Request, res: Response) {
    const id = Number(req.params.id);
    const agentId = Number(req.params.agentId);
    const service = new TasksService();
    const task = await service.removeMember(id, agentId);
    res.json(task);
  }
}
