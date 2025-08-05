# TaskFlow - Sistema de Gestión de Tareas con Bitácora

Un sistema completo de gestión de tareas internas con bitácora de actividades, desarrollado con tecnologías modernas.

## 🚀 Tecnologías Utilizadas

### Frontend
- **SvelteKit 2** - Framework web moderno
- **Svelte 5** - Reactividad y componentes
- **Tailwind CSS 4** - Framework de estilos
- **TypeScript** - Tipado estático

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM moderno
- **PostgreSQL** - Base de datos relacional

### Infraestructura
- **Docker** - Contenedores
- **Docker Compose** - Orquestación de servicios
- **pgAdmin** - Administración de base de datos

## 📋 Características

### Gestión de Tareas
- ✅ Número de expediente único (validación en tiempo real)
- ✅ Descripción detallada de tareas
- ✅ Estados: Pendiente, En Proceso, En Espera, Completado
- ✅ Asignación de agentes responsables
- ✅ Colaboradores opcionales
- ✅ Código de inventario asociado

### Agentes Predefinidos
- Juan Pablo, Marcos, Cesar, Mauro, Ezequiel
- Gustavo, Gerardo, Mauricio, Juan Manuel, Martha
- Paola, Rossana, Cristian, Matias

### Bitácora de Actividades
- ✅ Registro automático de cambios de estado
- ✅ Historial de asignaciones de agentes
- ✅ Timeline cronológico de actividades
- ✅ Información de usuario responsable
- ✅ Fecha y hora de cada acción

### Interfaz de Usuario
- ✅ Dashboard principal con tablero Kanban
- ✅ Formulario modal para crear/editar tareas
- ✅ Vista de bitácora desplegable
- ✅ Filtros por estado y agente
- ✅ Diseño responsive y moderno

## 🏗️ Arquitectura

```
taskflow/
├── backend/                 # API REST con Express
│   ├── prisma/             # Esquema de base de datos
│   ├── src/                # Código fuente del servidor
│   └── Dockerfile          # Contenedor del backend
├── frontend/               # Aplicación SvelteKit
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── routes/         # Páginas y rutas
│   │   └── lib/            # Utilidades y tipos
│   └── Dockerfile          # Contenedor del frontend
└── docker-compose.yml      # Orquestación de servicios
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd taskflow
```

### 2. Levantar servicios con Docker
```bash
docker compose up --build -d
```

### 3. Ejecutar migraciones y seed
```bash
# Acceder al contenedor del backend
docker compose exec backend sh

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Ejecutar seed de agentes
npm run db:seed
```

### 4. Acceder a la aplicación
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **pgAdmin**: http://localhost:5050
  - Email: admin@admin.com
  - Password: admin

## 📊 Base de Datos

### Modelos Principales

#### Task (Tarea)
- `id`: Identificador único
- `expediente`: Número de expediente (único)
- `description`: Descripción de la tarea
- `status`: Estado actual (PENDIENTE, EN_PROCESO, EN_ESPERA, COMPLETADO)
- `assignedTo`: Agente responsable
- `collaborator`: Colaborador opcional
- `inventory`: Código de inventario asociado

#### Agent (Agente)
- `id`: Identificador único
- `name`: Nombre del agente

#### Log (Bitácora)
- `id`: Identificador único
- `message`: Descripción de la actividad
- `createdAt`: Fecha y hora del registro
- `taskId`: Tarea asociada
- `agentId`: Agente responsable del cambio

#### Inventory (Inventario)
- `id`: Identificador único
- `code`: Código del inventario
- `type`: Tipo de inventario

## 🔧 Desarrollo

### Estructura de Comandos

```bash
# Backend
cd backend
npm install
npm run dev          # Servidor de desarrollo
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Poblar datos iniciales

# Frontend
cd frontend
npm install
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
```

### Variables de Entorno

#### Backend (.env)
```env
DATABASE_URL="postgresql://admin:12345678@db:5432/tareasdb?schema=public"
NODE_ENV=development
```

## 🎯 Funcionalidades Principales

### 1. Creación de Tareas
- Validación en tiempo real de expediente único
- Selección de agente responsable
- Asignación opcional de colaborador
- Código de inventario opcional
- Estado inicial configurable

### 2. Gestión de Estados
- Cambio de estado con registro automático en bitácora
- Estados: Pendiente → En Proceso → En Espera → Completado
- Historial completo de cambios

### 3. Tablero Kanban
- Vista organizada por columnas de estado
- Contador de tareas por estado
- Interfaz drag & drop (futuro)

### 4. Bitácora de Actividades
- Timeline cronológico de todas las actividades
- Información de usuario responsable
- Fecha y hora detallada
- Vista modal desplegable

## 🔒 Validaciones

### Frontend
- Expediente único (validación en tiempo real)
- Campos obligatorios
- Formato de datos

### Backend
- Validación de expediente único en base de datos
- Validación de relaciones entre entidades
- Manejo de errores con respuestas apropiadas

## 📱 Interfaz de Usuario

### Dashboard Principal
- Formulario de creación de tareas
- Tablero Kanban con filtros
- Contadores de tareas por estado

### Componentes Reutilizables
- `TaskForm.svelte`: Formulario de creación/edición
- `KanbanBoard.svelte`: Tablero de tareas
- `TaskCard.svelte`: Tarjeta individual de tarea
- `BitacoraModal.svelte`: Modal de bitácora

## 🚀 Despliegue

### Producción
```bash
# Construir imágenes
docker compose -f docker-compose.prod.yml build

# Levantar servicios
docker compose -f docker-compose.prod.yml up -d
```

### Desarrollo
```bash
# Levantar solo base de datos
docker compose up db pgadmin -d

# Ejecutar frontend y backend localmente
cd frontend && npm run dev
cd backend && npm run dev
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Faccendini1805** - [faccendini.gustavo@gmail.com](mailto:faccendini.gustavo@gmail.com)

---

⭐ Si este proyecto te resulta útil, ¡dale una estrella!
