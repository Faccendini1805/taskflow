# Roadmap - Taskflow

## Fase 0 - Preparación (Semana 0-1)
- [x] Definir arquitectura y tecnologías.
- [x] Crear estructura de carpetas y archivos base (backend y frontend).
- [x] Configurar Docker Compose con PostgreSQL y pgAdmin.
- [x] Configurar entorno de desarrollo con TypeScript y ESLint.

---

## Fase 1 - Backend básico (Semana 2-3)
- [x] Configurar Prisma y base de datos.
- [x] Implementar módulo de autenticación (login, registro, JWT).
- [x] Configuración de variables de entorno con validación.
- [x] Sistema de logging estructurado con Pino.
- [x] CRUD de usuarios y roles.
- [x] CRUD de tareas (sin relaciones complejas).
- [x] Middlewares de validación y autorización.
- [x] Utilidades comunes (fechas, archivos, mapeos)

---

## Fase 2 - Funcionalidades de tareas (Semana 4-5)
- [x] Asignación de dueños y colaboradores.
- [x] Historial de cambios de estado.
- [x] Adjuntos y etiquetas.
- [ ] Integración con servicios externos (HCD, etc.)
- [ ] Sistema de notificaciones
- [ ] Reportes básicos

---

## Fase 3 - Frontend (Semana 6-7)
- [x] Componentes base UI (Navbar, Sidebar, Tarjetas)
- [x] Tablero Kanban con arrastrar y soltar
- [ ] Sistema de autenticación (login/logout)
- [ ] Dashboard con métricas y resumen
- [ ] Lista de tareas con filtros y búsqueda
- [ ] Formulario de creación/edición de tareas
- [ ] Vista detallada de tarea
- [ ] Integración con API del backend
- [ ] Manejo de estados global (stores)
- [ ] Estilos y temas con Tailwind CSS

---

## Fase 4 - Integración externa (Semana 8)
- [ ] Implementar job de ingestión HCD.
- [ ] Actualización automática de estados desde fuente externa.
- [ ] Registro en logs y statusHistory.

---

## Fase 5 - Métricas y reportes (Semana 9)
- [ ] Panel de KPIs (lead time, throughput).
- [ ] Exportación a CSV/PDF.
- [ ] Alertas de tareas en espera prolongada.

---

## Fase 6 - Despliegue y cierre (Semana 10)
- [ ] Optimización de consultas e índices.
