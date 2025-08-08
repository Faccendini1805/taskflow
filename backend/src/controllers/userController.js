const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../utils/roles');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Get user by ID (admin only)
exports.getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        agent: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        agent: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el perfil del usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
exports.updateMe = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    // Get current user with password
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!currentUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    const updateData = {};

    // Update email if provided
    if (email) updateData.email = email;

    // Update password if currentPassword and newPassword are provided
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          status: 'error',
          message: 'La contraseña actual es incorrecta'
        });
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        agent: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Generate new token if email or password was updated
    let token;
    if (email || newPassword) {
      token = generateToken(updatedUser.id);
    }

    res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado correctamente',
      token,
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    
    // Handle unique constraint violation for email
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico ya está en uso'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el perfil del usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Get all users (only for ADMIN role)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        agent: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener la lista de usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Create a new user
exports.createUser = async (req, res) => {
  try {
    const { email, password, role = ROLES.AGENT, agentId } = req.body;

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Rol de usuario no válido'
      });
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe un usuario con este correo electrónico'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        agent: agentId ? { connect: { id: agentId } } : undefined
      },
      select: {
        id: true,
        email: true,
        role: true,
        agent: true,
        createdAt: true
      }
    });

    res.status(201).json({
      status: 'success',
      data: { user: newUser }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    if (error.code === 'P2025' && error.meta?.modelName === 'Agent') {
      return res.status(404).json({
        status: 'error',
        message: 'El agente especificado no existe'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error al crear el usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role, agentId, isActive } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: { agent: true }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    // Prevent updating your own role
    if (user.id === req.user.id && role && role !== user.role) {
      return res.status(400).json({
        status: 'error',
        message: 'No puedes cambiar tu propio rol'
      });
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (agentId !== undefined) {
      updateData.agent = agentId 
        ? { connect: { id: agentId } } 
        : { disconnect: true };
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        agent: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico ya está en uso'
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: error.meta?.cause || 'Recurso no encontrado'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'No puedes eliminar tu propio usuario'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar el usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
