# 🔐 Variables de Entorno - Guía de Configuración

## ¿Qué son las Variables de Entorno?

Las variables de entorno son valores de configuración que se guardan **fuera del código**, permitiendo:
- ✅ Mantener información sensible (claves, contraseñas) segura
- ✅ Usar diferentes valores en desarrollo y producción
- ✅ Cambiar configuraciones sin modificar el código

---

## 📝 Configuración Inicial

### 1. Crear archivo `.env`

En la raíz del proyecto, copia el archivo `.env.example` a `.env`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### 2. Configurar valores

Edita el archivo `.env` con tus valores:

```env
# Puerto del servidor
PORT=3000

# JWT Secret Key (IMPORTANTE: cambiar por una clave única)
JWT_SECRET=tu_clave_secreta_super_segura_aqui_123456

# JWT Expiración
JWT_EXPIRES_IN=24h

# Base de datos
DB_PATH=./database/database.db

# Entorno
NODE_ENV=development

# CORS
CORS_ORIGIN=*
```

---

## 🔑 Variables Disponibles

### `PORT`
- **Descripción:** Puerto en el que corre el servidor
- **Valor por defecto:** `3000`
- **Ejemplo:** `PORT=5000`

### `JWT_SECRET`
- **Descripción:** Clave secreta para firmar tokens JWT
- **Valor por defecto:** `fallback_secret_key_change_this`
- **IMPORTANTE:** ⚠️ DEBE ser cambiado en producción
- **Cómo generar una clave segura:**
  ```bash
  # En Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Ejemplo:** `JWT_SECRET=a3f8b2c1d4e5f6g7h8i9j0k1l2m3n4o5`

### `JWT_EXPIRES_IN`
- **Descripción:** Tiempo de expiración del token JWT
- **Valor por defecto:** `24h`
- **Formatos válidos:**
  - `60` (60 segundos)
  - `10m` (10 minutos)
  - `2h` (2 horas)
  - `7d` (7 días)
- **Ejemplo:** `JWT_EXPIRES_IN=7d`

### `DB_PATH`
- **Descripción:** Ruta al archivo de base de datos SQLite
- **Valor por defecto:** `./database/database.db`
- **Ejemplo:** `DB_PATH=./data/production.db`

### `NODE_ENV`
- **Descripción:** Entorno de ejecución
- **Valores válidos:** `development`, `production`, `test`
- **Valor por defecto:** `development`
- **Ejemplo:** `NODE_ENV=production`

### `CORS_ORIGIN`
- **Descripción:** Orígenes permitidos para CORS
- **Valor por defecto:** `*` (todos)
- **En producción:** URL específica de tu frontend
- **Ejemplo:** `CORS_ORIGIN=https://verdego.com`

---

## 🚀 Uso en el Código

### Acceder a variables de entorno

```javascript
// Cargar dotenv al inicio (en server.js)
require('dotenv').config();

// Acceder a las variables
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;
const nodeEnv = process.env.NODE_ENV;

console.log('Puerto:', port);
console.log('Entorno:', nodeEnv);
```

### Ejemplo en configuración JWT

```javascript
// backend/config/jwt.js
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_key';
const JWT_OPTIONS = {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
```

---

## 🔒 Seguridad

### ✅ HACER

1. **Agregar `.env` al `.gitignore`**
   ```
   .env
   ```

2. **Usar `.env.example` como plantilla**
   - Subir `.env.example` a GitHub (sin valores reales)
   - Compartir con el equipo como referencia

3. **Generar claves únicas y fuertes**
   ```bash
   # Generar clave segura
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Valores diferentes en desarrollo/producción**
   ```
   # .env (desarrollo)
   JWT_SECRET=dev_secret_123

   # .env.production (producción)
   JWT_SECRET=prod_a3f8b2c1d4e5f6g7h8i9j0k1l2m3n4o5
   ```

### ❌ NO HACER

1. ❌ Subir `.env` a GitHub
2. ❌ Hardcodear valores sensibles en el código
3. ❌ Compartir el archivo `.env` por email/chat
4. ❌ Usar la misma clave en desarrollo y producción
5. ❌ Dejar valores por defecto en producción

---

## 🌐 Despliegue en Producción

### Render.com

1. Ir a tu proyecto en Render
2. Settings → Environment
3. Agregar cada variable manualmente:
   ```
   JWT_SECRET = tu_clave_production_segura
   NODE_ENV = production
   PORT = 3000
   ```

### Heroku

```bash
heroku config:set JWT_SECRET=tu_clave_segura
heroku config:set NODE_ENV=production
```

### Vercel

Crear archivo `vercel.json`:
```json
{
  "env": {
    "JWT_SECRET": "@jwt-secret",
    "NODE_ENV": "production"
  }
}
```

---

## 🧪 Validación

### Verificar que las variables se cargaron correctamente

```javascript
// backend/server.js
console.log('🔍 Variables de entorno cargadas:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado');
console.log('DB_PATH:', process.env.DB_PATH);
```

### Script de validación

Agregar a `package.json`:
```json
{
  "scripts": {
    "check-env": "node -e \"require('dotenv').config(); console.log(process.env)\""
  }
}
```

Ejecutar:
```bash
npm run check-env
```

---

## 🆘 Troubleshooting

### Error: "JWT_SECRET no está definido"

**Solución:**
1. Verifica que existe el archivo `.env`
2. Verifica que `.env` tenga la variable `JWT_SECRET=valor`
3. Reinicia el servidor después de modificar `.env`

### Las variables no se cargan

**Solución:**
1. Asegúrate de que `require('dotenv').config()` está al inicio de `server.js`
2. Verifica la ruta del archivo `.env` (debe estar en la raíz)
3. Revisa que no haya espacios extras en el `.env`

### Diferentes valores en desarrollo/producción

**Solución:**
Usar múltiples archivos `.env`:
```
.env.development
.env.production
.env.test
```

Cargar el correcto:
```javascript
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
require('dotenv').config({ path: envFile });
```

---

## 📚 Referencias

- [Documentación de dotenv](https://www.npmjs.com/package/dotenv)
- [12 Factor App - Config](https://12factor.net/config)
- [Mejores prácticas de seguridad](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
