# Inicialización Automática de Ubicaciones

## 📍 Descripción

Este script inicializa automáticamente las ubicaciones predefinidas de VerdeGo en la base de datos cuando la aplicación se despliega por primera vez en Railway (o cualquier entorno nuevo).

## 🚀 Funcionamiento

### Ubicaciones Incluidas

El script incluye **33 ubicaciones** en Bogotá, Colombia:

- **18 Centros de Reciclaje VerdeGo**
  - 7 ubicaciones en diferentes localidades
  - 11 ubicaciones en universidades principales

- **15 Tiendas Aliadas**
  - Cadenas: Éxito, Carulla, Jumbo, Olímpica, PriceSmart, Makro, Alkosto

### Proceso de Inicialización

1. **Al iniciar el servidor** (`npm start`), se ejecuta automáticamente el script
2. **Verifica** si la tabla `locations` ya tiene datos
3. **Si está vacía**: Inserta todas las ubicaciones predefinidas
4. **Si tiene datos**: No hace nada (evita duplicados)

## 📝 Logs Esperados

### Primera ejecución (tabla vacía):
```
🔍 Verificando ubicaciones iniciales...
📍 Tabla de ubicaciones vacía. Insertando ubicaciones predefinidas...
✅ Insertadas 5/33 ubicaciones
✅ Insertadas 10/33 ubicaciones
✅ Insertadas 15/33 ubicaciones
✅ Insertadas 20/33 ubicaciones
✅ Insertadas 25/33 ubicaciones
✅ Insertadas 30/33 ubicaciones
✅ Insertadas 33/33 ubicaciones

📊 Resumen de inicialización:
   ✅ Ubicaciones insertadas: 33
   ❌ Errores: 0
🎉 ¡Inicialización de ubicaciones completada!
```

### Ejecuciones posteriores:
```
🔍 Verificando ubicaciones iniciales...
✅ Ya existen 33 ubicaciones. No se insertarán duplicados.
```

## 🔧 Archivos Relacionados

- **`backend/scripts/initLocations.js`** - Script de inicialización
- **`backend/server.js`** - Integración del script al iniciar

## 🎯 Uso en Railway

Cuando hagas `git push` y el código se despliegue en Railway:

1. Railway ejecutará `npm start`
2. El servidor se iniciará
3. Automáticamente se verificará la tabla `locations`
4. Si está vacía (primera vez), se poblarán las 33 ubicaciones
5. ¡Listo! Tus ubicaciones estarán disponibles sin hacer nada más

## 🔄 Actualizar Ubicaciones

Si deseas agregar más ubicaciones predefinidas:

1. Edita el archivo `backend/scripts/initLocations.js`
2. Agrega las nuevas ubicaciones al array `defaultLocations`
3. Las nuevas ubicaciones solo se insertarán si la tabla está vacía

## ⚠️ Importante

- El script **NO sobrescribe** datos existentes
- Solo se ejecuta **una vez** por base de datos nueva
- Si quieres volver a ejecutarlo, debes vaciar la tabla `locations` manualmente

## 🧪 Probar Localmente

Para probar que funciona correctamente:

1. Elimina tu base de datos local:
   ```bash
   rm database/database.db
   ```

2. Inicia el servidor:
   ```bash
   npm start
   ```

3. Verifica que las ubicaciones se insertaron:
   - Visita: http://localhost:3000/addlocation
   - Deberías ver las 33 ubicaciones en la lista

## 📊 Estructura de Ubicaciones

Cada ubicación incluye:
- **name**: Nombre descriptivo
- **address**: Dirección completa en Bogotá
- **latitude**: Coordenada de latitud
- **longitude**: Coordenada de longitud
- **type**: 'verdego' o 'aliada'

## ✅ Verificación en Railway

Después del despliegue, verifica que funcionó:

1. Accede a tu app en Railway
2. Ve a la URL: `https://tu-app.railway.app/addlocation`
3. Desplázate hasta la lista de ubicaciones
4. Deberías ver las 33 ubicaciones cargadas automáticamente

¡Listo! Ya no tendrás que agregar las ubicaciones manualmente cada vez que despliegues. 🌿
