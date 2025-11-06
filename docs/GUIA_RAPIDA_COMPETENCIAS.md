# 🚀 Guía Rápida - Sistema de Competencias

## Pasos para Probar el Sistema

### 1. Iniciar el Servidor
```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

### 2. Crear una Competencia Activa

**Opción A: Usando el Script**
```bash
node backend/scripts/competitionUtils.js create
```

**Opción B: Usando la API directamente**
Puedes usar un cliente como Postman o curl:
```bash
curl -X POST http://localhost:3000/api/crear-competencia \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Competencia Universitaria 2024",
    "startDate": "2024-10-25T00:00:00",
    "endDate": "2024-11-25T23:59:59",
    "rewardPercentage": 10
  }'
```

### 3. Acceder a la Página de Competencias

1. Abre tu navegador en `http://localhost:3000`
2. Inicia sesión con tu usuario
3. Haz clic en el botón "Competencias" en el menú superior
4. O visita directamente: `http://localhost:3000/pages/user/competitions`

### 4. Contribuir a una Universidad

1. En la página de competencias, verás el ranking de universidades
2. Haz clic en el botón "Contribuir" de la universidad que desees apoyar
3. Ingresa la cantidad de puntos que quieres contribuir
4. Confirma la contribución
5. Verás el ranking actualizado inmediatamente

### 5. Verificar Contribuciones

En la misma página de competencias, encontrarás:
- **Ranking actualizado** con tu contribución
- **Mis Contribuciones**: Historial de todas tus donaciones
- **Estadísticas**: Total contribuido, número de contribuciones

### 6. Finalizar una Competencia y Distribuir Recompensas

Cuando la competencia haya terminado:

```bash
node backend/scripts/competitionUtils.js finalize 1
```

(Reemplaza `1` con el ID de la competencia)

Esto:
- Calcula el top 3 de universidades
- Distribuye recompensas a todos los contribuyentes
- Marca la competencia como finalizada

### 7. Ver Ranking Histórico

En la página de competencias:
- Haz clic en el botón "Histórico Global"
- Verás el ranking acumulado de todas las competencias

## Comandos Útiles

### Listar todas las competencias
```bash
node backend/scripts/competitionUtils.js list
```

### Ver ranking de una competencia específica
```bash
node backend/scripts/competitionUtils.js ranking 1
```

### Ver ayuda del script
```bash
node backend/scripts/competitionUtils.js
```

## Estructura de Navegación

```
Inicio (index.html)
  └─ Botón "Competencias" → /pages/user/competitions
     ├─ Ver Competencia Activa
     ├─ Ranking de Universidades
     ├─ Contribuir Puntos
     └─ Mis Contribuciones

Sidebar de Usuario
  ├─ Mi Perfil (account.html)
  ├─ Mis Bonos (bonuses.html)
  ├─ Mis Recargas (recharges.html)
  └─ Competencias (competitions.html) ← NUEVO
```

## Datos de Prueba

### Universidades Predeterminadas
Ya se insertan automáticamente al crear la base de datos:
1. 🎓 Universidad Nacional de Colombia
2. 🏔️ Universidad de los Andes
3. ⚡ Universidad Javeriana
4. 🌹 Universidad del Rosario
5. 🦌 Universidad de Antioquia

### Flujo de Prueba Completo

1. **Preparar datos**
   - Asegúrate de tener un usuario con puntos
   - Crea una competencia activa

2. **Hacer contribuciones**
   - Contribuye a diferentes universidades
   - Prueba con diferentes cantidades
   - Verifica que se descuenten los puntos correctamente

3. **Ver resultados**
   - Revisa el ranking en tiempo real
   - Verifica tu historial de contribuciones
   - Cambia entre vista "Competencia Actual" e "Histórico Global"

4. **Finalizar y recibir recompensas**
   - Finaliza la competencia con el script
   - Verifica que los puntos se devuelvan con el bonus
   - Revisa que solo los contribuyentes del top 3 reciban recompensas

## Troubleshooting

### La página no carga
- Verifica que el servidor esté corriendo
- Revisa la consola del navegador (F12)
- Asegúrate de estar autenticado

### No puedo contribuir
- Verifica que tengas puntos suficientes
- Asegúrate de que hay una competencia activa
- Revisa que no haya expirado la fecha de finalización

### No veo universidades
- Ejecuta el servidor para que se creen automáticamente
- Revisa los logs del servidor

### Los puntos no se actualizan
- Refresca la página
- Verifica en la base de datos directamente
- Revisa los logs del servidor para errores

## Endpoints de API

Todos los endpoints están documentados en `docs/COMPETENCIAS.md`

### Principales
- `GET /api/competencia-activa` - Competencia actual
- `GET /api/ranking-universidades` - Ranking
- `POST /api/contribuir-universidad` - Contribuir (requiere auth)
- `GET /api/contribuciones/:userId` - Historial de usuario

## Características del Sistema

✅ **Transacciones Seguras**: Todo se hace en transacciones atómicas
✅ **Validación de Puntos**: No puedes contribuir más de lo que tienes
✅ **Ranking en Tiempo Real**: Se actualiza con cada contribución
✅ **Sistema de Recompensas**: Bonus según la posición de la universidad
✅ **Historial Completo**: Todas las contribuciones quedan registradas
✅ **Diseño Responsive**: Funciona en móviles y desktop
✅ **Animaciones Suaves**: Experiencia de usuario agradable

## Próximos Pasos

1. ¡Prueba el sistema completo!
2. Haz varias contribuciones
3. Finaliza una competencia
4. Verifica las recompensas
5. Crea una nueva competencia para seguir jugando

---

¿Problemas? Revisa:
- Logs del servidor (terminal donde ejecutas `npm start`)
- Consola del navegador (F12 → Console)
- Base de datos directamente (puedes usar DB Browser for SQLite)
