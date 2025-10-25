# Documentación de la API - VerdeGo

## Base URL
```
http://localhost:3000/api
```

## Autenticación

Todas las rutas protegidas requieren un token JWT en el header:
```
Authorization: Bearer <tu_token>
```

---

## 📋 Endpoints

### 🔐 Autenticación

#### Registrar Usuario
```http
POST /api/auth/register
```

**Body:**
```json
{
  "id": 123456789,
  "name": "Juan",
  "surname": "Pérez",
  "email": "juan@example.com",
  "password": "micontraseña123"
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Usuario creado exitosamente",
  "user": {
    "id": 123456789,
    "name": "Juan",
    "surname": "Pérez",
    "email": "juan@example.com"
  }
}
```

---

#### Iniciar Sesión
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "micontraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123456789,
    "name": "Juan",
    "surname": "Pérez",
    "email": "juan@example.com",
    "credits": 0,
    "rank_name": null
  }
}
```

---

#### Verificar Token
```http
GET /api/auth/verify
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Token válido",
  "user": {
    "id": 123456789,
    "name": "Juan",
    "surname": "Pérez",
    "email": "juan@example.com",
    "rank": null
  }
}
```

---

#### Obtener Perfil
```http
GET /api/auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Perfil obtenido",
  "user": {
    "id": 123456789,
    "name": "Juan",
    "surname": "Pérez",
    "email": "juan@example.com",
    "credits": 50,
    "created_at": "2025-10-24 10:30:00",
    "rank_name": "Bronce",
    "min_credits": 0,
    "max_credits": 100
  }
}
```

---

### 👥 Usuarios

#### Obtener Todos los Usuarios
```http
GET /api/users
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Usuarios obtenidos",
  "total": 3,
  "usuarios": [
    {
      "id": 123456789,
      "name": "Juan",
      "surname": "Pérez",
      "email": "juan@example.com",
      "credits": 50,
      "created_at": "2025-10-24 10:30:00",
      "rank_name": "Bronce"
    }
  ]
}
```

---

#### Buscar Usuario por Email
```http
GET /api/users/:email
```

**Ejemplo:**
```
GET /api/users/juan@example.com
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Usuario encontrado",
  "usuario": {
    "id": 123456789,
    "name": "Juan",
    "surname": "Pérez",
    "email": "juan@example.com",
    "credits": 50,
    "rank_name": "Bronce"
  }
}
```

---

#### Eliminar Usuario
```http
DELETE /api/users/:id
```

**Ejemplo:**
```
DELETE /api/users/123456789
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Usuario eliminado exitosamente",
  "id": 123456789
}
```

---

### 💳 Transacciones

#### Crear Transacción
```http
POST /api/transactions
```

**Body:**
```json
{
  "user_id": 123456789,
  "location_id": 1,
  "type": "deposit",
  "amount": 10
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Transacción creada exitosamente",
  "transaction": {
    "id": 1,
    "user_id": 123456789,
    "location_id": 1,
    "type": "deposit",
    "amount": 10
  }
}
```

---

#### Obtener Todas las Transacciones
```http
GET /api/transactions
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Transacciones obtenidas",
  "total": 5,
  "transactions": [
    {
      "id": 1,
      "user_id": 123456789,
      "location_id": 1,
      "type": "deposit",
      "amount": 10,
      "created_at": "2025-10-24 11:00:00",
      "user_name": "Juan",
      "user_surname": "Pérez",
      "user_email": "juan@example.com",
      "location_name": "Punto Verde Centro"
    }
  ]
}
```

---

### 📍 Ubicaciones

#### Obtener Todas las Ubicaciones
```http
GET /api/locations
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Ubicaciones obtenidas",
  "total": 2,
  "locations": [
    {
      "id": 1,
      "name": "Punto Verde Centro",
      "address": "Calle Principal 123",
      "latitude": -34.603722,
      "longitude": -58.381592,
      "type": "recycling",
      "created_at": "2025-10-20 08:00:00"
    }
  ]
}
```

---

#### Crear Ubicación
```http
POST /api/locations
```

**Body:**
```json
{
  "name": "Punto Verde Norte",
  "address": "Avenida Norte 456",
  "latitude": -34.583,
  "longitude": -58.456,
  "type": "recycling"
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Ubicación creada exitosamente",
  "location": {
    "id": 2,
    "name": "Punto Verde Norte",
    "address": "Avenida Norte 456",
    "latitude": -34.583,
    "longitude": -58.456,
    "type": "recycling"
  }
}
```

---

### 🏆 Rangos

#### Obtener Todos los Rangos
```http
GET /api/ranks
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Rangos obtenidos",
  "total": 4,
  "ranks": [
    {
      "id": 1,
      "name": "Bronce",
      "min_credits": 0,
      "max_credits": 100
    },
    {
      "id": 2,
      "name": "Plata",
      "min_credits": 101,
      "max_credits": 500
    },
    {
      "id": 3,
      "name": "Oro",
      "min_credits": 501,
      "max_credits": 1000
    },
    {
      "id": 4,
      "name": "Platino",
      "min_credits": 1001,
      "max_credits": 999999
    }
  ]
}
```

---

#### Crear Rango
```http
POST /api/ranks
```

**Body:**
```json
{
  "name": "Diamante",
  "min_credits": 5000,
  "max_credits": 999999
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Rango creado exitosamente",
  "rank": {
    "id": 5,
    "name": "Diamante",
    "min_credits": 5000,
    "max_credits": 999999
  }
}
```

---

## ❌ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Faltan campos obligatorios o datos inválidos |
| 401 | Unauthorized - Credenciales inválidas o token no proporcionado |
| 403 | Forbidden - Token inválido o expirado |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error en el servidor |

---

## 📝 Notas

- Los tokens JWT expiran después de **24 horas**
- Las contraseñas deben tener **mínimo 6 caracteres**
- Los IDs de usuario son **números de cédula** (no auto-incrementales)
- Los emails deben ser **únicos** en el sistema
- Las transacciones requieren que el usuario exista en la base de datos
