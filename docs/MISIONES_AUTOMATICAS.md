# Sistema Automático de Misiones Semanales

## 🎯 Funcionamiento

El sistema ahora **actualiza automáticamente las misiones semanales** sin necesidad de intervención manual. 

### ¿Cómo funciona?

1. **Detección automática de nueva semana**
   - El servidor verifica automáticamente si las misiones de la semana actual existen
   - Si detecta que es una nueva semana (lunes), automáticamente:
     - ❌ Desactiva las misiones de la semana pasada
     - 🗑️ Borra el progreso de todos los usuarios (las misiones NO son acumulables)
     - ✅ Crea 3 nuevas misiones para la semana actual

2. **Verificación en cada petición**
   - Cada vez que un usuario accede a las misiones, el sistema verifica si necesita actualizar
   - Solo verifica una vez por día para optimizar rendimiento
   - No afecta la velocidad de respuesta del servidor

3. **Verificación al iniciar el servidor**
   - Cuando el servidor se inicia, verifica inmediatamente las misiones
   - Si es lunes y aún no se han creado las misiones, las crea automáticamente

### 📅 Calendario de Misiones

- **Inicio de semana:** Lunes 00:00:00
- **Fin de semana:** Domingo 23:59:59
- **Renovación:** Automática cada lunes

### 🔄 Proceso Automático

```
Lunes 00:00:00
    ↓
Sistema detecta nueva semana
    ↓
Desactiva misiones antiguas
    ↓
Borra progreso de usuarios
    ↓
Crea 3 nuevas misiones
    ↓
Usuarios empiezan con progreso 0
```

## 🎮 Misiones Semanales

Cada semana incluye siempre estas 3 misiones:

1. **Reciclador de Papel Semanal**
   - Material: Papel y Cartón
   - Objetivo: 1 kg
   - Recompensa: 25 puntos

2. **Guerrero del Plástico**
   - Material: Plástico
   - Objetivo: 0.8 kg
   - Recompensa: 30 puntos

3. **Maestro del Reciclaje Verde**
   - Material: Orgánicos
   - Objetivo: 1.5 kg
   - Recompensa: 20 puntos

## ⚙️ Configuración Técnica

### Archivos del sistema

- `backend/middleware/weeklyMissionsUpdate.js` - Middleware de actualización automática
- `backend/server.js` - Integración del middleware
- `backend/scripts/createMissions.js` - Script manual (opcional)

### Variables importantes

```javascript
// Cacheo de verificaciones
lastCheckDate // Guarda la última fecha de verificación
isUpdating    // Previene actualizaciones simultáneas
```

## 🚀 Despliegue en Servidor

Cuando subas la aplicación a un servidor en producción:

1. **NO necesitas configurar cron jobs**
2. **NO necesitas ejecutar scripts manualmente**
3. **El sistema se auto-gestiona completamente**

### Requerimientos:
- El servidor debe estar corriendo 24/7
- La base de datos SQLite debe tener permisos de escritura
- Node.js debe estar instalado

### Ventajas:
✅ Sin intervención manual
✅ Sin dependencias de cron jobs del sistema operativo
✅ Funciona en cualquier hosting (Heroku, Railway, Vercel, etc.)
✅ Actualización inmediata al primer acceso del lunes

## 🔍 Monitoreo

El sistema registra en la consola:

```bash
# Al iniciar el servidor
🔍 Verificando misiones semanales...
✅ Misiones de la semana actual ya existen

# Cuando detecta nueva semana
🔄 Detectada nueva semana, actualizando misiones...
✅ Progreso de misiones antiguas eliminado
✅ Misión creada: "Reciclador de Papel Semanal"
✅ Misión creada: "Guerrero del Plástico"
✅ Misión creada: "Maestro del Reciclaje Verde"
🎉 Misiones semanales actualizadas: 3/3
📅 Semana: 2025-11-10 a 2025-11-17
```

## 🛠️ Mantenimiento

### Cambiar las misiones semanales

Si quieres modificar las misiones (nombre, recompensa, objetivo), edita el archivo:

```javascript
// backend/middleware/weeklyMissionsUpdate.js
const weeklyMissionsTemplate = [
    {
        name: 'Tu Misión',
        description: 'Descripción de la misión',
        material_type: 'paper|plastic|glass|metal|electronic|organic',
        target_weight: 1.0,
        reward_points: 25
    },
    // ... más misiones
];
```

### Script manual (opcional)

Si necesitas resetear manualmente las misiones:

```bash
# Limpiar toda la base de datos
node backend/scripts/clearDatabase.js

# Crear misiones de la semana actual
node backend/scripts/createMissions.js
```

## ✨ Resumen

**El sistema es completamente automático y autónomo.** Una vez desplegado en el servidor, las misiones se actualizarán solas cada lunes sin que tengas que hacer nada. 🎯
