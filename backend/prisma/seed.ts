import { PrismaClient, UserRole, MemberRole, Status, Priority, Action } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // Limpiar datos (solo para desarrollo)
  await prisma.taskTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.log.deleteMany();
  await prisma.statusChange.deleteMany();
  await prisma.taskMember.deleteMany();
  await prisma.task.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();
  await prisma.area.deleteMany();

  // Crear área
  const generalArea = await prisma.area.create({
    data: { name: 'General' }
  });

  // Crear etiquetas
  const urgenteTag = await prisma.tag.create({
    data: { name: 'Urgente' }
  });

  // Crear usuarios y agentes
  const passwordHash = await bcrypt.hash('12345678', SALT_ROUNDS);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@taskflow.com',
      password: passwordHash,
      role: UserRole.ADMIN,
      agent: {
        create: {
          name: 'Admin Principal',
          email: 'admin@taskflow.com'
        }
      }
    },
    include: { agent: true }
  });

  const agentUser = await prisma.user.create({
    data: {
      email: 'agent1@taskflow.com',
      password: passwordHash,
      role: UserRole.AGENT,
      agent: {
        create: {
          name: 'Agente 1',
          email: 'agent1@taskflow.com'
        }
      }
    },
    include: { agent: true }
  });

  // Crear inventario de prueba
  const inv = await prisma.inventory.create({
    data: { code: 'INV-001', type: 'Computadora' }
  });

  // Crear tarea con miembros
  const task1 = await prisma.task.create({
    data: {
      expediente: 'EXP-001',
      description: 'Revisión de sistemas internos',
      status: Status.PENDIENTE,
      priority: Priority.ALTA,
      areaId: generalArea.id,
      inventoryId: inv.id,
      members: {
        create: [
          { agentId: adminUser.agent!.id, role: MemberRole.OWNER },
          { agentId: agentUser.agent!.id, role: MemberRole.COLLABORATOR }
        ]
      },
      tags: {
        create: [{ tagId: urgenteTag.id }]
      }
    }
  });

  // Cambios de estado y logs para la tarea
  await prisma.statusChange.create({
    data: {
      taskId: task1.id,
      oldStatus: null,
      newStatus: Status.PENDIENTE,
      reason: 'Tarea creada',
      changedById: adminUser.agent!.id
    }
  });

  await prisma.log.createMany({
    data: [
      {
        taskId: task1.id,
        agentId: adminUser.agent!.id,
        action: Action.CREATE,
        message: 'Tarea creada por Admin'
      },
      {
        taskId: task1.id,
        agentId: agentUser.agent!.id,
        action: Action.ASSIGN,
        message: 'Agente 1 asignado como colaborador'
      }
    ]
  });

  console.log('✅ Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
