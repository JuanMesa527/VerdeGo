# Configuración de Railway para VerdeGo

## 🚂 Problema: Base de datos se reinicia en cada deploy

Railway crea un nuevo contenedor en cada deploy, por lo que **SQLite se borra** si no está en un volumen persistente.

## ✅ Solución: Configurar un Volumen Persistente

### Paso 1: Acceder al Dashboard de Railway

1. Ve a https://railway.app/
2. Abre tu proyecto **VerdeGo**
3. Selecciona el servicio donde está desplegada la aplicación

### Paso 2: Crear un Volumen

1. En el menú del servicio, haz clic en **"Settings"**
2. Desplázate hasta la sección **"Volumes"**
3. Haz clic en **"+ New Volume"**
4. Configura el volumen:
   - **Mount Path**: `/app/database`
   - **Name**: `verdego-database` (o el nombre que prefieras)
5. Haz clic en **"Add"**

### Paso 3: Configurar Variables de Entorno

En la sección **"Variables"** del servicio, agrega:

```bash
DB_PATH=/app/database/database.db
NODE_ENV=production
```

### Paso 4: Re-deploy

1. Haz clic en **"Deploy"** en el menú del servicio
2. Selecciona **"Redeploy"** para aplicar los cambios
3. O simplemente haz un nuevo `git push` y Railway detectará los cambios

---

## 📝 Verificación

Después del deploy, verifica en los logs que aparezca:

```
✅ Conectado a la base de datos SQLite en: /app/database/database.db
🔍 Verificando ubicaciones iniciales...
📍 Tabla de ubicaciones vacía. Insertando ubicaciones predefinidas...
✅ Insertadas 5/33 ubicaciones
...
✅ Insertadas 33/33 ubicaciones
🎉 ¡Inicialización de ubicaciones completada!
```

---

## 🔄 Si ya tienes deploys anteriores

Si ya hiciste varios deploys y la base de datos se borró:

1. Configura el volumen como se indicó arriba
2. **Elimina la base de datos local** (si existe en Railway)
3. Haz un nuevo deploy
4. El script `initLocations.js` detectará la tabla vacía e insertará las 33 ubicaciones automáticamente

---

## 🎯 Alternativa: Usar PostgreSQL (Recomendado para producción)

Si prefieres una base de datos más robusta:

1. En Railway, agrega un servicio **"PostgreSQL"**
2. Railway creará automáticamente las variables de entorno
3. Modifica `config/database.js` para usar PostgreSQL en lugar de SQLite
4. Instala `pg` en lugar de `sqlite3`

```bash
npm install pg
```

---

## ⚠️ Notas Importantes

- **El volumen es permanente**: Una vez creado, los datos persistirán entre deploys
- **Backups**: Railway hace backups automáticos si usas PostgreSQL, con SQLite debes hacerlos manualmente
- **Límites**: Verifica los límites de almacenamiento de tu plan en Railway

---

## 🆘 Solución de Problemas

### Las ubicaciones no se insertan

1. Verifica los logs en Railway
2. Busca mensajes de error de la base de datos
3. Confirma que el script `initLocations.js` se está ejecutando
4. Verifica que la tabla `locations` exista: deberías ver `✅ Tabla locations verificada/creada`

### La base de datos sigue reiniciándose

1. Confirma que el volumen está montado en `/app/database`
2. Verifica que `DB_PATH=/app/database/database.db` esté configurado
3. Revisa los logs para confirmar la ruta de la base de datos

### El script no encuentra la base de datos

Si ves errores como "unable to open database file":

1. Confirma que el directorio `/app/database` exista
2. El código ya crea el directorio automáticamente, pero verifica los permisos
3. Railway debe tener permisos de escritura en el volumen

---

## 📚 Recursos

- [Railway Volumes Documentation](https://docs.railway.app/guides/volumes)
- [Railway Environment Variables](https://docs.railway.app/guides/variables)
- [Railway Deployments](https://docs.railway.app/guides/deployments)
