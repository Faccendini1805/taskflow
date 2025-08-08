# 🛠️ TaskFlow - Plan Maestro de Desarrollo

## 📋 Tecnologías
- [x] SvelteKit 2 + Svelte 5
- [x] Tailwind CSS 4
- [x] Prisma ORM
- [x] PostgreSQL
- [x] Docker & Docker Compose
- [x] Node.js 22 (vía imagen oficial)

---

## 🚀 Configuración Inicial

### Estructura del Proyecto
- [x] Crear estructura de carpetas
  ```bash
  mkdir taskflow && cd taskflow
  mkdir backend frontend
  ```

### Frontend (SvelteKit)
- [x] Inicializar proyecto SvelteKit
  ```bash
  cd frontend
  npm create svelte@latest .
  # Elegir: Skeleton project + TypeScript + Tailwind + eslint + prettier
  npm install
  ```
- [x] Configurar Tailwind CSS
  ```bash
  # Verificar en tailwind.config.js:
  content: ['./src/**/*.{html,js,svelte,ts}']
  ```

### Backend (Node.js + Prisma)
- [x] Inicializar proyecto Node.js
  ```bash
  cd backend
  npm init -y
  npm install typescript ts-node prisma @prisma/client @types/node
  npx tsc --init
  npx prisma init
  ```
- [x] Configurar conexión a base de datos
  ```bash
  # En .env
  DATABASE_URL="postgresql://admin:12345678@db:5432/tareasdb?schema=public"
  ```

---

## 🐳 Configuración de Docker

### Backend
- [x] Crear Dockerfile para backend
  ```dockerfile
  FROM node:22-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 3000
  CMD ["npm", "run", "dev"]
  ```

### Frontend
- [x] Crear Dockerfile para frontend (versión actualizada)
  ```dockerfile
  FROM node:22-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install --legacy-peer-deps
  COPY . .
  EXPOSE 5173
  CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
  ```

### Docker Compose
- [x] Configurar docker-compose.yml
  ```yaml
  version: '3.8'
  services:
    db:
      image: postgres:16
      environment:
        POSTGRES_USER: admin
        POSTGRES_PASSWORD: 12345678
        POSTGRES_DB: tareasdb
      ports:
        - "5432:5432"
      volumes:
        - pgdata:/var/lib/postgresql/data

    pgadmin:
      image: dpage/pgadmin4
      environment:
        PGADMIN_DEFAULT_EMAIL: admin@admin.com
        PGADMIN_DEFAULT_PASSWORD: admin
      ports:
        - "5050:80"

    backend:
      build: ./backend
      ports:
        - "3000:3000"
      depends_on:
        - db
      environment:
        DATABASE_URL: "postgresql://admin:12345678@db:5432/tareasdb?schema=public"

    frontend:
      build: ./frontend
      ports:
        - "5173:5173"
      depends_on:
        - backend

  volumes:
    pgdata:
  ```

---

## 🚀 Despliegue

- [x] Iniciar contenedores
  ```bash
  docker-compose up --build -d
  ```
- [x] Aplicar migraciones
  ```bash
  docker-compose exec backend npx prisma migrate dev --name init
  ```
- [x] Cargar datos iniciales
  ```bash
  docker-compose exec backend npx ts-node prisma/seed.ts
  ```

## 🔗 Accesos
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)
- pgAdmin: [http://localhost:5050](http://localhost:5050) (admin/admin)
- PostgreSQL: `localhost:5432` (tareasdb)

## 📅 Próximas Tareas

### Backend
- [x] **Rutas de API**
  - [x] **Tareas (CRUD completo)**
    - [x] `GET /api/tasks` - Listar tareas con filtros
    - [x] `POST /api/tasks` - Crear nueva tarea con validación
    - [x] `GET /api/tasks/:id` - Obtener tarea por ID con relaciones
    - [x] `PUT /api/tasks/:id` - Actualizar tarea con validación
    - [x] `DELETE /api/tasks/:id` - Eliminar tarea (con limpieza de registros relacionados)
    - [x] `GET /api/tasks/:id/logs` - Obtener bitácora de tarea
    - [x] `GET /api/tasks/check/:expediente` - Verificar disponibilidad de expediente
  
  - [x] **Agentes (CRUD completo)**
    - [x] `GET /api/agents` - Listar agentes
    - [x] `POST /api/agents` - Crear agente
    - [x] `GET /api/agents/:id` - Obtener agente con tareas relacionadas
    - [x] `PUT /api/agents/:id` - Actualizar agente
    - [x] `DELETE /api/agents/:id` - Eliminar agente (con actualización de referencias)
  
  - [x] **Logs**
    - [x] `GET /api/logs/:taskId` - Obtener registros de una tarea
    - [x] `POST /api/logs` - Crear nuevo registro

- [x] **Validaciones**
  - [~] **Expediente único**
    - [x] Validación en creación
    - [x] Validación en actualización (permitir mismo expediente en la misma tarea)
    - [ ] Pruebas unitarias
  
  - [x] **Validación de fechas y estados**
    - [x] Formato de fechas ISO8601
    - [x] Estados válidos: PENDIENTE, EN_PROGRESO, COMPLETADO, CANCELADO
    - [x] Validación de transiciones de estado
  
  - [x] **Manejo de errores global**
    - [x] Middleware de manejo de errores
    - [x] Respuestas JSON estandarizadas
    - [x] Códigos de estado HTTP apropiados
    - [x] Logging de errores
    - [x] Modo desarrollo vs producción
- [x] **Seguridad**
  - [x] Rate limiting (100 solicitudes/15min por IP)
  - [x] Validación de entradas (express-validator)
  - [x] Sanitización de datos (xss-clean, express-mongo-sanitize)
  - [x] Headers de seguridad (helmet.js)
  - [x] Configuración CORS segura
  - [x] Limitación de tamaño de solicitud (10kb)
  - [x] Estructura para autenticación

### Frontend
- [x] **Tablero Kanban**
  - [x] Columnas por estado (Pendiente, En Progreso, Completado)
  - [x] Arrastrar y soltar tareas entre columnas
  - [x] Actualización en tiempo real (WebSockets)
  - [x] Indicadores visuales de estado
- [ ] **Gestión de Tareas**
  - [ ] Formulario de alta/edición
  - [ ] Búsqueda y filtrado avanzado
  - [ ] Ordenamiento por diferentes criterios
- [ ] **Bitácora de Actividades**
  - [ ] Modal con historial de cambios
  - [ ] Filtros por fecha y tipo de acción
  - [ ] Exportación a CSV/PDF
- [ ] **Filtros Avanzados**
  - [ ] Por estado de tarea
  - [ ] Por agente asignado
  - [ ] Por rango de fechas
  - [ ] Búsqueda por texto
- [ ] **Autenticación (Opcional)**
  - [ ] Login/Logout
  - [ ] Control de acceso basado en roles
  - [ ] Perfiles de usuario

## 🛠️ Flujo de Desarrollo

### Comandos de Docker
```bash
# Iniciar todos los servicios
docker-compose up -d

# Reconstruir y reiniciar un servicio
docker-compose up -d --build <servicio>

# Ver logs en tiempo real
docker-compose logs -f [servicio]

# Detener todos los contenedores
docker-compose down

# Eliminar volúmenes (cuidado: elimina datos)
docker-compose down -v
```

### Comandos de Prisma (Backend)
```bash
# Generar cliente de Prisma
docker-compose exec backend npx prisma generate

# Crear y aplicar migraciones
docker-compose exec backend npx prisma migrate dev --name nombre_migracion

# Ejecutar seed
docker-compose exec backend npx ts-node prisma/seed.ts

# Abrir Prisma Studio
docker-compose exec backend npx prisma studio
```

### Comandos de Desarrollo
```bash
# Instalar dependencias (frontend/backend)
npm install

# Ejecutar tests (si existen)
npm test

# Formatear código
npm run format

# Verificar tipos TypeScript
npx tsc --noEmit
```

## 📦 Dependencias Clave

### Frontend
- `@sveltejs/kit`: Framework web
- `tailwindcss`: Estilos
- `svelte-dnd-action`: Drag and drop para Kanban
- `date-fns`: Manejo de fechas

### Backend
- `express`: Servidor web
- `@prisma/client`: ORM para PostgreSQL
- `cors`: Middleware para CORS
- `helmet`: Seguridad HTTP

## 🚨 Solución de Problemas

### Si el frontend no se actualiza
1. Verificar logs: `docker-compose logs -f frontend`
2. Reconstruir contenedor: `docker-compose up -d --build frontend`
3. Limpiar caché del navegador

### Si hay problemas con la base de datos
1. Verificar estado: `docker-compose ps`
2. Revisar logs: `docker-compose logs -f db`
3. Si es necesario, reconstruir: 
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Si hay problemas de permisos
```bash
# Cambiar propietario de los archivos generados
docker-compose exec backend chown -R node:node /app/node_modules/.prisma
```