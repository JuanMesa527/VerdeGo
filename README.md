# VerdeGo 🌿

Sistema web de gestión de créditos y ubicaciones con autenticación JWT.

## 📁 Estructura del Proyecto

```
VerdeGo/
├── backend/                  # Servidor Node.js
│   ├── config/              # Configuración
│   │   ├── database.js      # Conexión a SQLite
│   │   └── jwt.js           # Configuración de JWT
│   ├── controllers/         # Lógica de negocio
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── transactionController.js
│   │   ├── locationController.js
│   │   └── rankController.js
│   ├── middleware/          # Middlewares
│   │   └── auth.js          # Verificación de JWT
│   ├── routes/              # Definición de rutas
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── locationRoutes.js
│   │   └── rankRoutes.js
│   └── server.js            # Punto de entrada del servidor
│
├── frontend/                # Aplicación web
│   ├── public/              # Archivos públicos
│   │   ├── assets/          # Recursos estáticos
│   │   │   ├── images/      # Imágenes
│   │   │   └── icons/       # Iconos
│   │   ├── css/             # Estilos
│   │   │   ├── style.css
│   │   │   └── auth.css
│   │   └── js/              # JavaScript
│   │       └── src/
│   │           └── auth.js  # Sistema de autenticación
│   ├── pages/               # Páginas HTML
│   │   ├── login.html
│   │   └── register.html
│   └── index.html           # Página principal
│
├── database/                # Base de datos SQLite
│   └── database.db
│
├── tests/                   # Archivos de pruebas
│   ├── test-api.html
│   └── test-database.html
│
├── docs/                    # Documentación
└── node_modules/            # Dependencias npm

```

## 🚀 Instalación

1. **Clonar el repositorio** (si aplica)

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   
   Copia el archivo `.env.example` a `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```
   
   Edita `.env` y configura tus valores (especialmente `JWT_SECRET`):
   ```env
   JWT_SECRET=tu_clave_secreta_unica_aqui
   PORT=3000
   NODE_ENV=development
   ```
   
   📚 **Más información:** Ver [docs/VARIABLES_ENTORNO.md](docs/VARIABLES_ENTORNO.md)

4. **Iniciar el servidor:**
   ```bash
   npm start
   ```

   El servidor se iniciará en `http://localhost:3000`

## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **SQLite3** - Base de datos
- **bcryptjs** - Hash de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **dotenv** - Variables de entorno
- **CORS** - Manejo de peticiones cross-origin

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos
- **JavaScript (Vanilla)** - Lógica del cliente
- **localStorage** - Persistencia de sesión

## 📊 Base de Datos

### Tablas

#### `users`
- `id` (INTEGER PRIMARY KEY) - Cédula del usuario
- `name` (TEXT) - Nombre
- `surname` (TEXT) - Apellido
- `email` (TEXT UNIQUE) - Correo electrónico
- `password` (TEXT) - Contraseña hasheada
- `credits` (INTEGER) - Créditos acumulados
- `rank_id` (INTEGER) - Rango del usuario
- `created_at` (DATETIME) - Fecha de registro

#### `ranks`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT) - Nombre del rango
- `min_credits` (INTEGER) - Créditos mínimos
- `max_credits` (INTEGER) - Créditos máximos

#### `locations`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT) - Nombre de la ubicación
- `address` (TEXT) - Dirección
- `latitude` (REAL) - Latitud
- `longitude` (REAL) - Longitud
- `type` (TEXT) - Tipo de ubicación
- `created_at` (DATETIME) - Fecha de creación

#### `transactions`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `user_id` (INTEGER) - ID del usuario
- `location_id` (INTEGER) - ID de la ubicación
- `type` (TEXT) - Tipo de transacción
- `amount` (INTEGER) - Cantidad de créditos
- `created_at` (DATETIME) - Fecha de transacción

## 🔐 API Endpoints

### Autenticación

#### `POST /api/auth/register`
Registrar nuevo usuario
```json
{
  "id": 123456789,
  "name": "Juan",
  "surname": "Pérez",
  "email": "juan@example.com",
  "password": "contraseña123"
}
```

#### `POST /api/auth/login`
Iniciar sesión
```json
{
  "email": "juan@example.com",
  "password": "contraseña123"
}
```

#### `GET /api/auth/verify`
Verificar token (requiere autenticación)

#### `GET /api/auth/profile`
Obtener perfil del usuario (requiere autenticación)

### Usuarios

#### `GET /api/users`
Obtener todos los usuarios

#### `GET /api/users/:email`
Buscar usuario por email

#### `DELETE /api/users/:id`
Eliminar usuario

### Transacciones

#### `POST /api/transactions`
Crear nueva transacción
```json
{
  "user_id": 123456789,
  "location_id": 1,
  "type": "deposit",
  "amount": 10
}
```

#### `GET /api/transactions`
Obtener todas las transacciones

### Ubicaciones

#### `GET /api/locations`
Obtener todas las ubicaciones

#### `POST /api/locations`
Crear nueva ubicación

### Rangos

#### `GET /api/ranks`
Obtener todos los rangos

#### `POST /api/ranks`
Crear nuevo rango

## 🔒 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para autenticación:

1. El usuario se registra o inicia sesión
2. El servidor genera un token JWT
3. El frontend guarda el token en `localStorage`
4. Las peticiones a rutas protegidas incluyen el token en el header:
   ```
   Authorization: Bearer <token>
   ```
5. El middleware `verificarToken` valida el token en cada petición

**Duración del token:** 24 horas

## 🧪 Testing

Los archivos de prueba están en la carpeta `tests/`:

- `test-database.html` - Pruebas de la base de datos
- `test-api.html` - Pruebas del API

Abre estos archivos en el navegador mientras el servidor está corriendo.

## 📝 Rutas Legacy

Para mantener compatibilidad con el código anterior, se mantienen estas rutas:

- `/api/crear-usuario` → `/api/auth/register`
- `/api/login` → `/api/auth/login`
- `/api/verificar-token` → `/api/auth/verify`
- `/api/perfil` → `/api/auth/profile`
- `/api/usuarios` → `/api/users`
- `/api/ubicaciones` → `/api/locations`
- `/api/transaccion` → `/api/transactions`

## 🔧 Scripts NPM

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor con nodemon (reinicio automático)

## � Seguridad

### Variables de Entorno

Este proyecto usa **dotenv** para manejar configuración sensible. 

**IMPORTANTE antes de desplegar a producción:**

1. ✅ Generar un `JWT_SECRET` único y fuerte:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. ✅ Configurar variables de entorno en tu plataforma (Render, Heroku, etc.)

3. ✅ **NUNCA** subir el archivo `.env` a GitHub

4. ✅ Usar HTTPS en producción

📚 **Guía completa:** [docs/VARIABLES_ENTORNO.md](docs/VARIABLES_ENTORNO.md)

## �📄 Licencia

Este proyecto fue creado como parte de un ejercicio de aprendizaje de Node.js.

## 👨‍💻 Autor

Desarrollado como proyecto de graduación en Ingeniería de Sistemas.

---

**Nota de Seguridad:** Recuerda cambiar `JWT_SECRET` en `backend/config/jwt.js` antes de desplegar a producción. Se recomienda usar variables de entorno (.env).
