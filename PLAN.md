
---

## `PLAN.md`
```md
# Plan Maestro - Taskflow

## 1. Objetivo
Implementar un sistema integral de gestión de tareas para el área, que permita:
- Registrar y asignar tareas.
- Monitorear su avance.
- Auditar acciones y cambios.
- Integrarse con fuentes externas de tickets.

## 2. Alcance funcional
- CRUD de tareas.
- Roles de usuario (ADMIN, SUPERVISOR, AGENT, AUDITOR).
- Asignación de dueños y colaboradores.
- Cambios de estado con historial.
- Gestión de adjuntos y etiquetas.
- Panel de métricas (lead time, throughput, backlog).
- Integración de tickets externos (HCD).

## 3. Alcance técnico
- **Frontend**: SvelteKit 2 + Tailwind CSS 4 + TypeScript.
- **Backend**: Node.js + Express + Prisma + PostgreSQL.
- **Infraestructura**: Docker, Docker Compose, pgAdmin.
- **Integraciones**: módulo de scraping/API HCD.

## 4. Arquitectura
- Monorepo: `/frontend` y `/backend` separados.
- Backend: API RESTful con control de acceso por roles.
- Base de datos: PostgreSQL con Prisma ORM.
- Frontend: SPA con SvelteKit, comunicación vía fetch/REST.
- Infraestructura: contenedores orquestados con Docker Compose.

## 5. Seguridad
- Autenticación JWT.
- Autorización por roles (RBAC).
- Sanitización de entradas y validación de datos.
- Limitación de tamaño de archivos adjuntos.
- Variables de entorno para credenciales.

## 6. Plan de desarrollo
1. Definición y migración de schema de base de datos.
2. Backend:
   - Rutas de autenticación y usuarios.
   - CRUD de tareas.
   - Endpoints de asignación, cambios de estado, adjuntos.
   - Integración con tickets externos.
3. Frontend:
   - Login y dashboard.
   - Vista Kanban y lista filtrable.
   - Vista detalle con historial y adjuntos.
4. Métricas y reportes.
5. Pruebas e implementación en entorno de producción.

## 7. KPIs
- % tareas completadas en plazo.
- Tiempo promedio de ciclo.
- Tareas en espera > X días.
- Productividad por agente.

## 8. Entregables
- Backend funcional con API documentada.
- Frontend responsive con tablero y reportes.
- Documentación técnica y manual de usuario.
- Integración de ingestión de tickets externos.
