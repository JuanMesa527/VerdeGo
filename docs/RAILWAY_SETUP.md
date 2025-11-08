# Configuración de Railway para VerdeGo

## 🚂 Problema: Base de datos se reinicia en cada deploy

Railway crea un nuevo contenedor en cada deploy, por lo que **SQLite se borra** si no está en un volumen persistente.

## ✅ Solución 1: Usar PostgreSQL (RECOMENDADO)

Railway recomienda usar bases de datos administradas en lugar de volúmenes para SQLite. PostgreSQL es gratuito en Railway y mucho más robusto.

### Opción A: Agregar PostgreSQL a tu Proyecto

1. Ve a https://railway.app/
2. Abre tu proyecto **VerdeGo**
3. Haz clic en **"+ New"** → **"Database"** → **"Add PostgreSQL"**
4. Railway creará automáticamente las variables de entorno:
   - `DATABASE_URL`
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

**IMPORTANTE:** Tendrías que migrar de SQLite a PostgreSQL (cambiar el código de la base de datos)

---

## ✅ Solución 2: Mantener SQLite con Volumen (Railway V2)

Si prefieres mantener SQLite, necesitas configurar un volumen:

### Paso 1: Agregar Volumen desde el Dashboard

**IMPORTANTE:** Railway V2 cambió la interfaz. Ahora los volúmenes se agregan así:

1. Ve a tu proyecto en Railway
2. Haz clic en tu servicio (donde está desplegado VerdeGo)
3. En el menú superior, busca la pestaña **"Data"** o **"Storage"**
4. Si NO aparece esta opción, crea el volumen desde la CLI:

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Listar proyectos
railway list

# Conectar al proyecto
railway link

# Crear volumen
railway volume create verdego-database --mount-path /app/database
```

### Paso 2: Variables de Entorno

En la sección **"Variables"** del servicio:

```bash
DB_PATH=/app/database/database.db
NODE_ENV=production
```

### Paso 3: Re-deploy

Después de agregar el volumen, haz un nuevo deploy

---

## ✅ Solución 3: WORKAROUND Simple (Temporal)

Si Railway no te permite crear volúmenes fácilmente, usa esta solución temporal:

### Opción: Usar variables de entorno para las ubicaciones

En lugar de inicializar desde el script, puedes:

1. Acepta que la base de datos se reinicie
2. El script `initLocations.js` se ejecutará en **cada deploy**
3. Insertará las ubicaciones si la tabla está vacía

**Esto funciona si solo necesitas las ubicaciones predefinidas y no guardas datos de usuarios críticos en Railway.**

Para datos de usuarios, deberías usar PostgreSQL.

---

## 🎯 RECOMENDACIÓN FINAL

**Para producción real, usa PostgreSQL:**

1. Es gratuito en Railway (500MB)
2. Persiste automáticamente
3. Más robusto y escalable
4. Railway hace backups automáticos

**Para desarrollo/pruebas:**

SQLite con el script de inicialización es suficiente. Se reiniciará en cada deploy pero las ubicaciones se vuelven a crear automáticamente.

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
