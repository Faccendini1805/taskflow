# Taskflow

**Taskflow** es un sistema de gestión de tareas y seguimiento de flujo de trabajo para equipos operativos.  
Diseñado para registrar, asignar, auditar y reportar tareas, con integración de fuentes externas como sistemas de ticketing (ej: HCD).

## Tecnologías

### Frontend
- [SvelteKit 2](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/)  
- [Tailwind CSS 4](https://tailwindcss.com/)  
- [TypeScript](https://www.typescriptlang.org/)

### Backend
- [Node.js](https://nodejs.org/)  
- [Express.js](https://expressjs.com/)  
- [Prisma](https://www.prisma.io/) ORM  
- [PostgreSQL](https://www.postgresql.org/)

### Infraestructura
- [Docker](https://www.docker.com/)  
- [Docker Compose](https://docs.docker.com/compose/)  
- [pgAdmin](https://www.pgadmin.org/)

## Características
- Gestión de tareas con **dueño y colaboradores**.
- Historial completo de **cambios de estado** y **acciones**.
- Asignación por áreas/unidades.
- Adjuntos y etiquetas.
- Integración con fuentes externas de tickets.
- Panel de métricas y tablero Kanban.

## Requisitos previos
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (local o en contenedor)

## Instalación y ejecución

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/taskflow.git
cd taskflow

# Variables de entorno
cp .env.example .env

# Construir y levantar contenedores
docker-compose up -d

# Instalar dependencias backend
cd backend
npm install

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar backend
npm run dev

# Instalar dependencias frontend
cd ../frontend
npm install

# Iniciar frontend
npm run dev
Estructura de carpetas


taskflow/
│
├── backend/                        # API REST, lógica de negocio y conexión a la BD
│   ├── src/
│   │   ├── app.ts                   # Punto de entrada principal de Express (middlewares, rutas base)
│   │   ├── server.ts                # Inicialización del servidor HTTP
│   │   ├── config/                  # Configuraciones centralizadas
│   │   │   ├── env.ts               # Lectura y validación de variables de entorno
│   │   │   ├── db.ts                # Conexión Prisma/PostgreSQL
│   │   │   └── logger.ts            # Logger central (winston/pino)
│   │   ├── modules/                 # Módulos de negocio separados por dominio
│   │   │   ├── auth/                # Autenticación y autorización
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── tasks/               # Gestión de tareas
│   │   │   │   ├── tasks.controller.ts
│   │   │   │   ├── tasks.routes.ts
│   │   │   │   ├── tasks.service.ts
│   │   │   │   └── tasks.repository.ts
│   │   │   ├── agents/              # Gestión de agentes
│   │   │   ├── areas/               # Gestión de áreas/unidades
│   │   │   └── attachments/         # Subida y gestión de archivos adjuntos
│   │   ├── middlewares/             # Middlewares globales y específicos
│   │   │   ├── authGuard.ts         # Protección de rutas según rol
│   │   │   ├── errorHandler.ts      # Manejo centralizado de errores
│   │   │   └── validateRequest.ts   # Validación de body/query/params
│   │   ├── utils/                   # Utilidades y helpers reutilizables
│   │   │   ├── date.utils.ts
│   │   │   ├── file.utils.ts
│   │   │   └── statusMapper.ts      # Mapea estados externos al enum interno
│   │   └── jobs/                    # Procesos en segundo plano (cron, colas)
│   │       ├── syncHcd.job.ts       # Ingesta y actualización de tickets HCD
│   │       └── notify.job.ts        # Notificaciones por email/chat
│   ├── prisma/
│   │   ├── schema.prisma            # Definición de la base de datos
│   │   ├── migrations/              # Migraciones generadas por Prisma
│   │   └── seed.ts                  # Script para datos iniciales
│   ├── tests/                       # Pruebas unitarias e integrales
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                        # Aplicación SvelteKit (UI)
│   ├── src/
│   │   ├── routes/                  # Páginas y endpoints frontend
│   │   │   ├── +layout.svelte       # Layout principal
│   │   │   ├── +page.svelte         # Página de inicio/dashboard
│   │   │   ├── login/               # Vista de login
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.ts         # Lógica de autenticación
│   │   │   ├── tasks/               # Gestión de tareas (lista, kanban, detalle)
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── [id]/+page.svelte
│   │   │   │   └── [id]/+page.ts
│   │   ├── lib/                     # Componentes y helpers compartidos
│   │   │   ├── components/
│   │   │   │   ├── Navbar.svelte
│   │   │   │   ├── Sidebar.svelte
│   │   │   │   ├── KanbanBoard.svelte
│   │   │   │   └── TaskCard.svelte
│   │   │   ├── stores/              # Stores Svelte para estado global
│   │   │   │   ├── auth.store.ts
│   │   │   │   └── tasks.store.ts
│   │   │   └── utils/
│   │   │       ├── fetchClient.ts   # Cliente para llamadas API con auth
│   │   │       └── formatDate.ts
│   │   ├── styles/                  # Estilos globales
│   │   │   ├── globals.css
│   │   │   └── tailwind.css
│   │   └── app.html                  # Template HTML base
│   ├── static/                      # Recursos estáticos (logos, íconos)
│   ├── package.json
│   └── tailwind.config.js
│
├── docker-compose.yml               # Orquestación de contenedores (backend, frontend, db, pgAdmin)
├── .env.example                     # Variables de entorno de ejemplo
├── PLAN.md                          # Plan maestro técnico y funcional
├── ROADMAP.md                       # Línea de tiempo y hitos del proyecto
└── README.md                        # Documentación principal

Resumen de usos
backend/src/config/ → Centraliza configuraciones (DB, logger, variables).

backend/src/modules/ → Módulos independientes para cada dominio (auth, tasks, agents...).

backend/src/middlewares/ → Validaciones y protecciones para rutas.

backend/src/utils/ → Funciones genéricas (formateo, mapeos, helpers).

backend/src/jobs/ → Procesos automáticos como sincronización de tickets HCD.

backend/prisma/ → Definición y control de la base de datos.

frontend/src/routes/ → Páginas y rutas del cliente.

frontend/src/lib/components/ → Componentes UI reutilizables.

frontend/src/lib/stores/ → Estado global en Svelte (auth, tareas...).

frontend/src/lib/utils/ → Funciones de utilidad para el cliente.

frontend/src/styles/ → Estilos globales y configuración de Tailwind.

frontend/static/ → Recursos estáticos accesibles directamente.

Licencia
MIT © 2025 Gustavo