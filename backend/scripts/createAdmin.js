const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const adminData = {
    email: 'admin@taskflow.com',
    password: await bcrypt.hash('Admin123!', 12),
    role: 'ADMIN',
    agent: {
      create: {
        name: 'Administrador',
        email: 'admin@taskflow.com',
        phone: '000-000-0000',
        isActive: true
      }
    }
  };

  try {
    // Verificar si ya existe un administrador
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingAdmin) {
      console.log('El usuario administrador ya existe');
      return;
    }

    // Crear el administrador
    const admin = await prisma.user.create({
      data: adminData,
      include: {
        agent: true
      }
    });

    console.log('Usuario administrador creado exitosamente:', admin);
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
