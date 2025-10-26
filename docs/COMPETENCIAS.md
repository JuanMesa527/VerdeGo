# 🏆 Sistema de Competencias de Universidades

## Descripción

El sistema de competencias permite a los usuarios apoyar a sus universidades favoritas contribuyendo con sus puntos. Al final de cada competencia, las 3 universidades con más puntos ganan y sus contribuyentes reciben recompensas.

## Características Principales

### Para Usuarios
- **Contribuir Puntos**: Los usuarios pueden donar sus puntos a la universidad de su elección
- **Ver Ranking**: Visualizar el ranking en tiempo real de las universidades
- **Historial**: Ver todas las contribuciones realizadas
- **Recompensas**: Recibir puntos de vuelta + un bonus al finalizar la competencia

### Sistema de Recompensas
Cuando una competencia finaliza, los usuarios que contribuyeron a las top 3 universidades reciben:

- **1er Lugar**: 15% de sus puntos contribuidos (10% base + 50% bonus)
- **2do Lugar**: 12.5% de sus puntos contribuidos (10% base + 25% bonus)
- **3er Lugar**: 11% de sus puntos contribuidos (10% base + 10% bonus)

### Universidades Predeterminadas
1. 🎓 Universidad Nacional de Colombia
2. 🏔️ Universidad de los Andes
3. ⚡ Universidad Javeriana
4. 🌹 Universidad del Rosario
5. 🦌 Universidad de Antioquia

## Estructura de Base de Datos

### Tabla: `competitions`
Almacena las competencias activas y finalizadas.

```sql
CREATE TABLE competitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status TEXT DEFAULT 'active',
    reward_percentage INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Tabla: `universities`
Almacena las universidades participantes.

```sql
CREATE TABLE universities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    logo TEXT NOT NULL,
    total_points INTEGER DEFAULT 0,
    color TEXT DEFAULT '#4CAF50',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Tabla: `university_contributions`
Registra cada contribución de puntos.

```sql
CREATE TABLE university_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    university_id INTEGER NOT NULL,
    competition_id INTEGER NOT NULL,
    points_contributed INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (university_id) REFERENCES universities(id),
    FOREIGN KEY (competition_id) REFERENCES competitions(id)
)
```

### Tabla: `competition_rewards`
Almacena las recompensas distribuidas.

```sql
CREATE TABLE competition_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    competition_id INTEGER NOT NULL,
    university_id INTEGER NOT NULL,
    points_contributed INTEGER NOT NULL,
    reward_points INTEGER NOT NULL,
    university_rank INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (competition_id) REFERENCES competitions(id),
    FOREIGN KEY (university_id) REFERENCES universities(id)
)
```

## API Endpoints

### GET `/api/competencia-activa`
Obtiene la competencia activa actual.

**Respuesta:**
```json
{
  "competition": {
    "id": 1,
    "name": "Competencia Universitaria 2024",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "status": "active",
    "reward_percentage": 10
  },
  "hasActive": true
}
```

### GET `/api/ranking-universidades`
Obtiene el ranking de universidades.

**Query Parameters:**
- `competitionId` (opcional): ID de la competencia específica

**Respuesta:**
```json
{
  "ranking": [
    {
      "id": 1,
      "name": "Universidad Nacional de Colombia",
      "logo": "🎓",
      "color": "#DC143C",
      "total_points": 5000,
      "total_contributors": 45,
      "rank": 1
    }
  ],
  "total": 5
}
```

### GET `/api/universidades`
Obtiene todas las universidades disponibles.

### POST `/api/contribuir-universidad`
Contribuir puntos a una universidad.

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "userId": 123,
  "universityId": 1,
  "points": 100,
  "competitionId": 1
}
```

**Respuesta:**
```json
{
  "mensaje": "Contribución exitosa",
  "contributionId": 456,
  "pointsContributed": 100,
  "newBalance": 400
}
```

### GET `/api/contribuciones/:userId`
Obtiene las contribuciones de un usuario.

**Query Parameters:**
- `competitionId` (opcional): Filtrar por competencia

### POST `/api/crear-competencia`
Crea una nueva competencia (admin).

**Body:**
```json
{
  "name": "Competencia 2024",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "rewardPercentage": 10
}
```

### POST `/api/finalizar-competencia/:competitionId`
Finaliza una competencia y distribuye recompensas (admin).

## Scripts de Utilidades

### Crear una competencia
```bash
node backend/scripts/competitionUtils.js create
```

### Listar competencias
```bash
node backend/scripts/competitionUtils.js list
```

### Ver ranking de una competencia
```bash
node backend/scripts/competitionUtils.js ranking 1
```

### Finalizar competencia
```bash
node backend/scripts/competitionUtils.js finalize 1
```

## Flujo de Usuario

1. **Inicio**: Usuario ingresa a la página de competencias
2. **Visualizar**: Ve el ranking actual de universidades
3. **Seleccionar**: Elige una universidad para apoyar
4. **Contribuir**: Dona puntos de su balance
5. **Seguimiento**: Puede ver el ranking actualizarse en tiempo real
6. **Recompensa**: Al finalizar la competencia, recibe puntos si su universidad quedó en el top 3

## Arquitectura Frontend

### Página: `competitions.html`
- Header con navegación
- Sidebar con menú de usuario
- Información de competencia activa
- Ranking de universidades
- Historial de contribuciones
- Modal para contribuir

### Estilos: `competitions.css`
- Diseño moderno con degradados
- Tarjetas destacadas para top 3
- Animaciones suaves
- Responsive design

### JavaScript: `competitions.js`
- Carga de datos desde API
- Gestión de contribuciones
- Actualización en tiempo real
- Validaciones y feedback

## Consideraciones de Seguridad

1. ✅ Autenticación requerida para contribuir
2. ✅ Validación de puntos disponibles
3. ✅ Transacciones atómicas en base de datos
4. ✅ Verificación de competencia activa
5. ✅ Protección contra contribuciones negativas

## Mejoras Futuras

- [ ] Notificaciones push cuando una universidad sube de posición
- [ ] Gráficos de evolución del ranking
- [ ] Sistema de logros por contribuciones
- [ ] Competencias con categorías (por facultad, etc.)
- [ ] Integración con redes sociales para compartir
- [ ] Panel administrativo completo
- [ ] Sistema de badges especiales para top contribuyentes

## Mantenimiento

### Crear nueva competencia
1. Ejecutar script de creación o usar endpoint API
2. Configurar fechas y porcentaje de recompensa
3. Verificar que esté marcada como 'active'

### Finalizar competencia
1. Esperar a que termine el período
2. Ejecutar script de finalización o usar endpoint API
3. Verificar distribución de recompensas
4. Cambiar estado a 'finished'

### Monitoreo
- Revisar logs de contribuciones
- Verificar integridad de puntos
- Monitorear participación de usuarios

## Soporte

Para reportar problemas o sugerencias:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Última actualización**: Octubre 2024
**Versión**: 1.0.0
