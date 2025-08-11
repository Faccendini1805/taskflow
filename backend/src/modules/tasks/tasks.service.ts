import { MemberRole, Priority, Status } from '@prisma/client';
import { TasksRepository } from './tasks.repository';

export class TasksService {
  constructor(private repo = new TasksRepository()) {}

  create(input: {
    expediente: string;
    description: string;
    areaId?: number | null;
    priority?: Priority;
    ownerAgentId: number;
    inventoryId?: number | null;
    tags?: number[];
  }) {
    return this.repo.create(input);
  }

  get(id: number) {
    return this.repo.findById(id);
  }

  list(filters: {
    status?: Status;
    areaId?: number;
    priority?: Priority;
    ownerAgentId?: number;
    collabAgentId?: number;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    return this.repo.list(filters);
  }

  updateBasics(id: number, data: { description?: string; areaId?: number | null; priority?: Priority; dueDate?: Date | null; inventoryId?: number | null; }) {
    return this.repo.updateBasics(id, data);
  }

  changeStatus(id: number, newStatus: Status, reason?: string, agentId?: number) {
    return this.repo.changeStatus(id, newStatus, reason, agentId);
  }

  addMember(taskId: number, agentId: number, role: MemberRole) {
    return this.repo.upsertMember(taskId, agentId, role);
  }

  removeMember(taskId: number, agentId: number) {
    return this.repo.removeMember(taskId, agentId);
  }
}
