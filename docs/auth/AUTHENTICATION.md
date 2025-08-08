# Sistema de Autenticación y Autorización

## Visión General

El sistema de autenticación de TaskFlow utiliza JSON Web Tokens (JWT) para manejar la autenticación de usuarios. La autorización se gestiona mediante un sistema de roles y permisos que permite controlar el acceso a diferentes recursos de la aplicación.

## Componentes Principales

### 1. Autenticación (JWT)

- **Login**: Los usuarios inician sesión con su correo electrónico y contraseña.
- **Tokens JWT**: Se emiten tokens con una duración configurable (por defecto 7 días).
- **Renovación**: Los tokens pueden renovarse mediante el endpoint de verificación.
- **Logout**: Los tokens se invalidan en el cliente, pero se mantiene la capacidad de revocación en el servidor.

### 2. Roles de Usuario

| Rol        | Descripción                                      |
|------------|--------------------------------------------------|
| `ADMIN`    | Acceso completo al sistema                       |
| `SUPERVISOR` | Puede gestionar tareas y agentes asignados      |
| `AGENT`    | Usuario estándar con acceso limitado             |

### 3. Middleware de Seguridad

- **Autenticación**: Verifica la validez del token JWT.
- **Autorización**: Restringe el acceso basado en roles y permisos.
- **Validación**: Valida los datos de entrada para prevenir inyecciones.

## Configuración

### Variables de Entorno

```env
# JWT
JWT_SECRET=tu_clave_secreta_segura
JWT_EXPIRES_IN=7d

# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow

# Otros
NODE_ENV=development
```

## Uso

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Verificación de Token

```http
GET /api/v1/auth/verify
Authorization: Bearer <token>
```

### Protección de Rutas

```javascript
// Ruta protegida para cualquier usuario autenticado
router.get('/protegida', authenticate, (req, res) => {
  res.json({ mensaje: 'Ruta protegida' });
});

// Ruta solo para administradores
router.get('/admin', authenticate, restrictTo('ADMIN'), (req, res) => {
  res.json({ mensaje: 'Solo para administradores' });
});
```

## Seguridad

- Las contraseñas se almacenan con hash bcrypt.
- Los tokens JWT están firmados y tienen fecha de expiración.
- Se recomienda usar HTTPS en producción.
- Se implementa rate limiting para prevenir ataques de fuerza bruta.

## Flujo de Autenticación

1. El usuario envía credenciales al endpoint de login.
2. El servidor verifica las credenciales y emite un JWT.
3. El cliente almacena el token y lo envía en el encabezado `Authorization`.
4. Para solicitudes protegidas, el servidor verifica el token.
5. Si el token es válido, se concede acceso al recurso solicitado.

## Manejo de Errores

| Código | Error                    | Descripción                             |
|--------|--------------------------|-----------------------------------------|
| 401    | No autorizado           | Token no proporcionado o inválido        |
| 403    | Prohibido               | Permisos insuficientes                 |
| 400    | Solicitud incorrecta     | Datos de entrada inválidos             |
