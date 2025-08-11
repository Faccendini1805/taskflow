import { Prisma, PrismaClient, Status, MemberRole, Priority } from '@prisma/client';
import { prisma } from '../../config/db';

export class TasksRepository {
  constructor(private db: PrismaClient = prisma) {}

  create(data: {
    expediente: string;
    description: string;
    areaId?: number | null;
    priority?: Priority;
    ownerAgentId: number;
    inventoryId?: number | null;
    tags?: number[];
  }) {
    return this.db.task.create({
      data: {
        expediente: data.expediente,
        description: data.description,
        areaId: data.areaId ?? null,
        priority: data.priority ?? 'MEDIA',
        inventoryId: data.inventoryId ?? null,
        members: { create: [{ agentId: data.ownerAgentId, role: 'OWNER' }] },
        tags: data.tags?.length ? { create: data.tags.map((tagId) => ({ tagId })) } : undefined,
        logs: { create: { action: 'CREATE', message: 'Tarea creada' } },
        statusHistory: { create: { oldStatus: null, newStatus: 'PENDIENTE', reason: 'Creación' } }
      },
      include: this.includeBasic()
    });
  }

  findById(id: number) {
    return this.db.task.findUnique({
      where: { id },
      include: this.includeBasic()
    });
  }

  list(params: {
    status?: Status;
    areaId?: number;
    priority?: Priority;
    ownerAgentId?: number;
    collabAgentId?: number;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { page = 1, pageSize = 20 } = params;
    const where: Prisma.TaskWhereInput = {
      status: params.status,
      areaId: params.areaId,
      priority: params.priority,
      AND: [
        params.ownerAgentId
          ? { members: { some: { role: 'OWNER', agentId: params.ownerAgentId } } }
          : {},
        params.collabAgentId
          ? { members: { some: { role: 'COLLABORATOR', agentId: params.collabAgentId } } }
          : {},
        params.search
          ? {
              OR: [
                { expediente: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } }
              ]
            }
          : {}
      ]
    };
    return this.db.task.findMany({
      where,
      include: this.includeBasic(),
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
  }

  updateBasics(id: number, data: { description?: string; areaId?: number | null; priority?: Priority; dueDate?: Date | null; inventoryId?: number | null; }) {
    return this.db.task.update({
      where: { id },
      data,
      include: this.includeBasic()
    });
  }

  async changeStatus(id: number, newStatus: Status, reason: string | undefined, agentId?: number) {
    return this.db.$transaction(async (tx) => {
      const prev = await tx.task.findUnique({ where: { id } });
      if (!prev) return null;
      const now = new Date();
      const data: Prisma.TaskUpdateInput = {
        status: newStatus,
        startedAt: newStatus === 'EN_PROCESO' && !prev.startedAt ? now : prev.startedAt,
        closedAt: ['COMPLETADO', 'CANCELADO'].includes(newStatus) ? now : null
      };
      const updated = await tx.task.update({ where: { id }, data });
      await tx.statusChange.create({
        data: {
          taskId: id,
          oldStatus: prev.status,
          newStatus,
          reason,
          changedById: agentId
        }
      });
      await tx.log.create({
        data: {
          taskId: id,
          agentId,
          action: 'STATUS_CHANGE',
          message: `→ ${newStatus}${reason ? ` | ${reason}` : ''}`
        }
      });
      return tx.task.findUnique({ where: { id }, include: this.includeBasic() });
    });
  }

  async upsertMember(taskId: number, agentId: number, role: MemberRole) {
    await this.db.taskMember.upsert({
      where: { taskId_agentId: { taskId, agentId } },
      create: { taskId, agentId, role },
      update: { role }
    });
    await this.db.log.create({
      data: { taskId, agentId, action: 'ASSIGN', message: `Asignado como ${role}` }
    });
    return this.findById(taskId);
  }

  async removeMember(taskId: number, agentId: number) {
    await this.db.taskMember.delete({ where: { taskId_agentId: { taskId, agentId } } });
    await this.db.log.create({
      data: { taskId, agentId: null, action: 'ASSIGN', message: `Removido agente ${agentId}` }
    });
    return this.findById(taskId);
  }

  private includeBasic() {
    return {
      area: true,
      members: { include: { agent: true } },
      tags: { include: { tag: true } },
      inventory: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
      logs: { orderBy: { createdAt: 'asc' } }
    };
  }
}
