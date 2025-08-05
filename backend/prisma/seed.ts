import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const agents = [
    'Juan Pablo', 'Marcos', 'Cesar', 'Mauro', 'Ezequiel',
    'Gustavo', 'Gerardo', 'Mauricio', 'Juan Manuel', 'Martha',
    'Paola', 'Rossana', 'Cristian', 'Matias'
  ];

  for (const name of agents) {
    await prisma.agent.create({
      data: { name }
    });
  }

  console.log('✅ Agentes iniciales creados exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 