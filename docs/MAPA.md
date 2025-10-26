# 🗺️ Mapa Interactivo de Ubicaciones - VerdeGo

## 📋 Descripción

El mapa interactivo muestra todas las ubicaciones registradas en la base de datos (tabla `locations`). Utiliza **Leaflet.js**, una biblioteca de mapas de código abierto, ligera y con excelente experiencia de usuario. El mapa está centrado en **Bogotá, Colombia** y muestra dos tipos de ubicaciones.

## ✨ Características

- **Mapa interactivo** centrado en Bogotá, Colombia
- **Marcadores personalizados** con emojis según el tipo de ubicación
- **Filtros dinámicos** para mostrar ubicaciones por categoría
- **Popups informativos** con detalles de cada ubicación
- **Botón "Cómo llegar"** que abre Google Maps con direcciones
- **Diseño responsivo** que funciona en móviles y tablets
- **Contador de ubicaciones** en tiempo real
- **Animaciones suaves** y transiciones

## 🎨 Tipos de Ubicaciones

El mapa soporta los siguientes tipos de ubicaciones:

| Tipo | Emoji | Color | Descripción |
|------|-------|-------|-------------|
| `verdego` | 🌿 | Verde | Ubicaciones VerdeGo (puntos de reciclaje oficiales) |
| `aliada` | 🏪 | Azul | Tiendas Aliadas (comercios asociados) |

## 🚀 Implementación

### Archivos Modificados/Creados

1. **`frontend/index.html`**
   - Estructura del mapa y secciones
   - Referencias a Leaflet CSS y JS
   - Contenedor del mapa y filtros
   - 2 filtros: Ubicaciones VerdeGo y Tiendas Aliadas

2. **`frontend/public/js/map.js`**
   - Lógica del mapa interactivo
   - Carga de ubicaciones desde API
   - Sistema de filtros
   - Marcadores personalizados
   - Centrado en Bogotá (4.7110, -74.0721)

3. **`frontend/public/css/style.css`**
   - Estilos del mapa y secciones
   - Marcadores personalizados
   - Popups informativos
   - Diseño responsivo

4. **`backend/database/seed-locations.js`**
   - Script para poblar ubicaciones de ejemplo
   - 12 ubicaciones en diferentes localidades de Bogotá

5. **`backend/database/clear-locations.js`**
   - Script para limpiar ubicaciones existentes
   - Reinicia el contador de IDs

## 📦 Dependencias

### Frontend
- **Leaflet.js v1.9.4** (CDN)
  - CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
  - JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`

### Backend
- No requiere dependencias adicionales
- Usa la API existente: `GET /api/ubicaciones`

## 🔧 Uso

### 1. Iniciar el Servidor

```powershell
cd backend
node server.js
```

### 2. Poblar Ubicaciones de Ejemplo (Opcional)

Si tu base de datos está vacía, puedes agregar ubicaciones de ejemplo en Bogotá:

```powershell
cd backend
node database/seed-locations.js
```

### 3. Limpiar Ubicaciones Existentes (Si es necesario)

```powershell
cd backend
node database/clear-locations.js
```

### 4. Abrir el Frontend

Visita: `http://localhost:3000`

El mapa se cargará automáticamente en la página de inicio.

## � Características del Mapa

### Filtros
- **Todas**: Muestra todas las ubicaciones
- **Ubicaciones VerdeGo**: Solo puntos oficiales VerdeGo (🌿)
- **Tiendas Aliadas**: Solo comercios asociados (🏪)

### Interacciones
- **Click en marcador**: Muestra información detallada
- **Botón "Cómo llegar"**: Abre Google Maps
- **Zoom**: Scroll o botones +/-
- **Arrastrar**: Mover el mapa

### Información Mostrada
- Nombre de la ubicación
- Dirección completa
- Tipo de ubicación
- Botón de navegación

## 📍 Ubicaciones de Ejemplo en Bogotá

El script de seed incluye 12 ubicaciones distribuidas en diferentes localidades:

### Ubicaciones VerdeGo (7)
1. Centro Chapinero
2. Usaquén
3. Fontibón
4. Engativá
5. Kennedy
6. Teusaquillo
7. San Cristóbal

### Tiendas Aliadas (5)
1. Éxito Suba
2. Carulla Zona Rosa
3. Jumbo Calle 80
4. Olímpica Bosa
5. PriceSmart Soacha

## 📱 Diseño Responsivo

El mapa se adapta automáticamente a diferentes tamaños de pantalla:

- **Desktop**: Mapa de 600px de alto, filtros horizontales
- **Tablet**: Mapa de 500px, filtros ajustados
- **Mobile**: Mapa de 400px, filtros apilados

## 🔄 Integración con el Backend

### Endpoint Utilizado
```javascript
GET http://localhost:3000/api/ubicaciones
```

### Respuesta Esperada
```json
{
  "mensaje": "Ubicaciones obtenidas",
  "total": 12,
  "locations": [
    {
      "id": 1,
      "name": "VerdeGo Centro Chapinero",
      "address": "Carrera 13 #53-45, Chapinero, Bogotá",
      "latitude": 4.6533,
      "longitude": -74.0621,
      "type": "verdego",
      "created_at": "2025-01-15 10:30:00"
    }
  ]
}
```

## 🎨 Personalización

### Cambiar el Centro del Mapa

En `frontend/public/js/map.js`, línea 30:

```javascript
map = L.map('map', {
    center: [4.7110, -74.0721], // Coordenadas de Bogotá
    zoom: 12, // Cambiar nivel de zoom
    // ...
});
```

### Agregar Nuevos Tipos de Ubicaciones

1. **En el backend** (`locationController.js`): Acepta el nuevo tipo
2. **En `map.js`**: Agregar icono y configuración
3. **En `index.html`**: Agregar botón de filtro
4. **En `style.css`**: Agregar estilos del marcador

### Cambiar el Estilo del Mapa

En `frontend/public/js/map.js`, línea 36:

```javascript
// Cambiar a otro proveedor de tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // ...
}).addTo(map);

// Opciones alternativas:
// - CartoDB: https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png
// - Stamen: https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png
```

## � Solución de Problemas

### El mapa no se muestra
- Verifica que el servidor backend esté corriendo
- Revisa la consola del navegador para errores
- Asegúrate de que Leaflet CSS/JS se carguen correctamente

### No aparecen ubicaciones
- Verifica que haya datos en la tabla `locations`
- Ejecuta el script de seed: `node database/seed-locations.js`
- Revisa que las coordenadas sean válidas (latitude, longitude)

### Marcadores no se ven bien
- Limpia el caché del navegador
- Verifica que los estilos CSS se hayan cargado

## 📈 Mejoras Futuras

- [ ] Búsqueda de ubicaciones por nombre
- [ ] Geolocalización del usuario
- [ ] Rutas entre ubicaciones
- [ ] Clusterización de marcadores
- [ ] Vista de lista + mapa
- [ ] Filtros avanzados (horario, servicios)
- [ ] Compartir ubicaciones
- [ ] Calificaciones y comentarios

## 📄 Licencia

Este mapa es parte del proyecto VerdeGo y utiliza:
- **Leaflet.js**: BSD 2-Clause License
- **OpenStreetMap**: ODbL License

## 🤝 Contribuciones

Para agregar nuevas ubicaciones:

1. Usar el endpoint: `POST /api/ubicacion`
2. Proporcionar: `name`, `address`, `latitude`, `longitude`, `type`
3. Los tipos válidos son: `verdego` o `aliada`
4. El mapa se actualizará automáticamente

## 📞 Soporte

Si encuentras problemas o tienes sugerencias, contacta al equipo de desarrollo de VerdeGo.

## 🚀 Implementación

### Archivos Modificados/Creados

1. **`frontend/index.html`**
   - Estructura del mapa y secciones
   - Referencias a Leaflet CSS y JS
   - Contenedor del mapa y filtros

2. **`frontend/public/js/map.js`**
   - Lógica del mapa interactivo
   - Carga de ubicaciones desde API
   - Sistema de filtros
   - Marcadores personalizados

3. **`frontend/public/css/style.css`**
   - Estilos del mapa y secciones
   - Marcadores personalizados
   - Popups informativos
   - Diseño responsivo

4. **`backend/database/seed-locations.js`** (opcional)
   - Script para poblar ubicaciones de ejemplo
   - 10 ubicaciones en diferentes distritos de Lima

## 📦 Dependencias

### Frontend
- **Leaflet.js v1.9.4** (CDN)
  - CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
  - JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`

### Backend
- No requiere dependencias adicionales
- Usa la API existente: `GET /api/ubicaciones`

## 🔧 Uso

### 1. Iniciar el Servidor

```powershell
cd backend
node server.js
```

### 2. Poblar Ubicaciones de Ejemplo (Opcional)

Si tu base de datos está vacía, puedes agregar ubicaciones de ejemplo:

```powershell
cd backend
node database/seed-locations.js
```

### 3. Abrir el Frontend

Visita: `http://localhost:3000`

El mapa se cargará automáticamente en la página de inicio.

## 🎯 Características del Mapa

### Filtros
- **Todas**: Muestra todas las ubicaciones
- **Reciclaje**: Solo centros de reciclaje (♻️)
- **Centros Verdes**: Solo puntos verdes (🌱)
- **Contenedores**: Solo contenedores (🗑️)

### Interacciones
- **Click en marcador**: Muestra información detallada
- **Botón "Cómo llegar"**: Abre Google Maps
- **Zoom**: Scroll o botones +/-
- **Arrastrar**: Mover el mapa

### Información Mostrada
- Nombre de la ubicación
- Dirección completa
- Tipo de ubicación
- Botón de navegación

## 📱 Diseño Responsivo

El mapa se adapta automáticamente a diferentes tamaños de pantalla:

- **Desktop**: Mapa de 600px de alto, filtros horizontales
- **Tablet**: Mapa de 500px, filtros ajustados
- **Mobile**: Mapa de 400px, filtros apilados

## 🔄 Integración con el Backend

### Endpoint Utilizado
```javascript
GET http://localhost:3000/api/ubicaciones
```

### Respuesta Esperada
```json
{
  "mensaje": "Ubicaciones obtenidas",
  "total": 10,
  "locations": [
    {
      "id": 1,
      "name": "Centro de Reciclaje San Isidro",
      "address": "Av. Javier Prado Este 450, San Isidro",
      "latitude": -12.0931,
      "longitude": -77.0465,
      "type": "reciclaje",
      "created_at": "2025-01-15 10:30:00"
    }
  ]
}
```

## 🎨 Personalización

### Cambiar el Centro del Mapa

En `frontend/public/js/map.js`, línea 37:

```javascript
map = L.map('map', {
    center: [-12.0464, -77.0428], // Cambiar coordenadas
    zoom: 12, // Cambiar nivel de zoom
    // ...
});
```

### Agregar Nuevos Tipos de Ubicaciones

1. **En el backend** (`locationController.js`): Acepta el nuevo tipo
2. **En `map.js`**: Agregar icono y configuración
3. **En `index.html`**: Agregar botón de filtro
4. **En `style.css`**: Agregar estilos del marcador

### Cambiar el Estilo del Mapa

En `frontend/public/js/map.js`, línea 43:

```javascript
// Cambiar a otro proveedor de tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // ...
}).addTo(map);

// Opciones alternativas:
// - CartoDB: https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png
// - Stamen: https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png
```

## 🐛 Solución de Problemas

### El mapa no se muestra
- Verifica que el servidor backend esté corriendo
- Revisa la consola del navegador para errores
- Asegúrate de que Leaflet CSS/JS se carguen correctamente

### No aparecen ubicaciones
- Verifica que haya datos en la tabla `locations`
- Ejecuta el script de seed: `node database/seed-locations.js`
- Revisa que las coordenadas sean válidas (latitude, longitude)

### Marcadores no se ven bien
- Limpia el caché del navegador
- Verifica que los estilos CSS se hayan cargado

## 📈 Mejoras Futuras

- [ ] Búsqueda de ubicaciones por nombre
- [ ] Geolocalización del usuario
- [ ] Rutas entre ubicaciones
- [ ] Clusterización de marcadores
- [ ] Vista de lista + mapa
- [ ] Filtros avanzados (horario, servicios)
- [ ] Compartir ubicaciones
- [ ] Calificaciones y comentarios

## 📄 Licencia

Este mapa es parte del proyecto VerdeGo y utiliza:
- **Leaflet.js**: BSD 2-Clause License
- **OpenStreetMap**: ODbL License

## 🤝 Contribuciones

Para agregar nuevas ubicaciones:

1. Usar el endpoint: `POST /api/ubicacion`
2. Proporcionar: `name`, `address`, `latitude`, `longitude`, `type`
3. El mapa se actualizará automáticamente

## 📞 Soporte

Si encuentras problemas o tienes sugerencias, contacta al equipo de desarrollo de VerdeGo.
