
---

## `PLAN.md`
```md
# Plan Maestro - Taskflow

## 1. Objetivo
Implementar un sistema integral de gestión de tareas que permita:
- Registrar, asignar y auditar tareas.
- Monitorear su avance y estado.
- Integrarse con sistemas de ticketing externos.

---

## 2. Alcance funcional
- CRUD de tareas.
- Roles de usuario (ADMIN, SUPERVISOR, AGENT, AUDITOR).
- Asignación de dueños y colaboradores.
- Historial de cambios de estado.
- Adjuntos y etiquetas.
- Panel de métricas y reportes.
- Integración de tickets externos (HCD).

---

## 3. Alcance técnico
- **Frontend**: SvelteKit 2, Tailwind CSS 4, TypeScript.
- **Backend**: Node.js, Express, Prisma, PostgreSQL.
- **Infraestructura**: Docker, Docker Compose, pgAdmin.
- **Estructura modular** en `/backend/src/modules` y `/frontend/src/lib`.

---

## 4. Arquitectura
- Monorepo: carpetas `frontend` y `backend`.
- Backend modular con capas **controller → service → repository**.
- Base de datos gestionada por Prisma ORM.
- Frontend con SvelteKit, comunicación vía API REST.
- Jobs automáticos para sincronización externa.

---

## 5. Seguridad
- Autenticación con JWT.
- Autorización por roles (RBAC).
- Validación y sanitización de inputs.
- Control de tamaño y tipo de archivos adjuntos.

---

## 6. Plan de desarrollo
1. Configuración inicial del monorepo y estructura de carpetas.
2. Implementar backend básico (auth, CRUD tareas).
3. Implementar frontend básico (login, dashboard, lista de tareas).
4. Añadir funcionalidades avanzadas (colaboradores, adjuntos, historial).
5. Integrar ingestión de tickets externos.
6. Panel de métricas y optimización.
7. Despliegue y documentación final.

---

## 7. KPIs
- % de tareas completadas en plazo.
- Tiempo promedio de ciclo.
- Productividad por agente.
- Número de tareas en espera > X días.

---

## 8. Entregables
- Backend con API REST documentada.
- Frontend responsive con tablero y reportes.
- Documentación técnica y manual de usuario.
- Integración con ticketing externo.
