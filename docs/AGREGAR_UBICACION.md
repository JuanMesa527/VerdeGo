# Formulario de Agregar Ubicación

## Descripción
Formulario interactivo para agregar nuevas ubicaciones al mapa de VerdeGo. Incluye selección visual desde el mapa y todos los campos de la tabla `locations`.

## Acceso
- **URL**: `http://localhost:3000/addlocation`
- **URL en producción**: `https://tu-dominio.com/addlocation`

## Características

### 📍 Campos del Formulario

1. **Nombre de la ubicación*** (obligatorio)
   - Texto descriptivo de la ubicación
   - Ejemplo: "VerdeGo Centro Chapinero"

2. **Tipo de ubicación*** (obligatorio)
   - `verdego`: Centro de Reciclaje VerdeGo
   - `aliada`: Tienda Aliada

3. **Dirección completa*** (obligatorio)
   - Dirección física de la ubicación
   - Ejemplo: "Carrera 13 #53-45, Chapinero, Bogotá"

4. **Latitud** (opcional)
   - Coordenada de latitud
   - Se llena automáticamente al seleccionar desde el mapa

5. **Longitud** (opcional)
   - Coordenada de longitud
   - Se llena automáticamente al seleccionar desde el mapa

### 🗺️ Funcionalidades del Mapa

#### Selección por Clic
- Haz clic en cualquier punto del mapa para seleccionar la ubicación
- Las coordenadas se llenan automáticamente
- Aparece un marcador que puedes arrastrar para ajustar la posición

#### Búsqueda de Dirección
- Usa el campo de búsqueda en la esquina superior derecha del mapa
- Escribe una dirección y presiona Enter o clic en el botón de búsqueda
- El mapa se centra automáticamente en la ubicación encontrada

#### Marcador Arrastrable
- El marcador puede arrastrarse para ajustar la ubicación exacta
- Al mover el marcador, las coordenadas se actualizan automáticamente

#### Geocodificación Inversa
- Al hacer clic en el mapa, se intenta obtener la dirección automáticamente
- Si el campo de dirección está vacío, se llena con la dirección encontrada

#### Coordenadas Manuales
- Puedes ingresar las coordenadas directamente en los campos
- Al cambiar las coordenadas, el marcador se actualiza automáticamente

## 🚀 Uso

### 1. Acceder al Formulario
```
http://localhost:3000/addlocation
```

### 2. Completar el Formulario

#### Opción A: Seleccionar desde el Mapa
1. Haz clic en el punto deseado del mapa
2. El marcador aparecerá y las coordenadas se llenarán automáticamente
3. Completa el nombre y tipo de ubicación
4. Verifica o edita la dirección si es necesario
5. Haz clic en "Guardar Ubicación"

#### Opción B: Buscar Dirección
1. Escribe la dirección en el campo de búsqueda del mapa
2. Presiona Enter o clic en el botón de búsqueda
3. Ajusta el marcador si es necesario
4. Completa los campos restantes
5. Haz clic en "Guardar Ubicación"

#### Opción C: Ingresar Manualmente
1. Completa todos los campos del formulario
2. Si tienes las coordenadas, ingrésalas directamente
3. El mapa se actualizará automáticamente
4. Haz clic en "Guardar Ubicación"

### 3. Confirmación
- Si la ubicación se guarda exitosamente, verás un mensaje de confirmación
- Serás redirigido automáticamente al mapa principal después de 2 segundos
- La nueva ubicación aparecerá en el mapa de VerdeGo

## 📝 Validaciones

- **Nombre**: Campo obligatorio
- **Tipo**: Debe seleccionar una opción (verdego o aliada)
- **Dirección**: Campo obligatorio
- **Latitud**: Opcional, debe estar entre -90 y 90
- **Longitud**: Opcional, debe estar entre -180 y 180

## 🎨 Diseño Responsive

El formulario es totalmente responsive y se adapta a diferentes tamaños de pantalla:
- Desktop: Layout de dos columnas
- Tablet/Mobile: Layout de una columna
- El mapa mantiene proporciones adecuadas en todos los dispositivos

## 🔧 Tecnologías Utilizadas

- **Leaflet.js**: Librería de mapas interactivos
- **OpenStreetMap**: Tiles del mapa
- **Nominatim API**: Geocodificación y búsqueda de direcciones
- **Fetch API**: Comunicación con el backend
- **CSS Grid**: Layout responsive

## 📡 API Endpoints

### POST /api/locations
Crea una nueva ubicación

**Body:**
```json
{
  "name": "VerdeGo Centro Chapinero",
  "type": "verdego",
  "address": "Carrera 13 #53-45, Chapinero, Bogotá",
  "latitude": 4.6533,
  "longitude": -74.0621
}
```

**Respuesta exitosa:**
```json
{
  "mensaje": "Ubicación creada exitosamente",
  "location": {
    "id": 1,
    "name": "VerdeGo Centro Chapinero",
    "address": "Carrera 13 #53-45, Chapinero, Bogotá",
    "latitude": 4.6533,
    "longitude": -74.0621,
    "type": "verdego"
  }
}
```

## 🔐 Seguridad

### Consideraciones
- Actualmente el formulario no requiere autenticación
- Recomendado: Agregar middleware de autenticación para proteger el endpoint
- Validar y sanitizar datos en el backend

### Mejoras Sugeridas para Producción
```javascript
// Agregar autenticación al endpoint
app.post('/api/locations', verificarToken, verificarAdmin, locationController.createLocation);
```

## 🐛 Solución de Problemas

### El mapa no carga
- Verifica la conexión a internet
- Revisa la consola del navegador para errores
- Asegúrate de que Leaflet.js esté cargando correctamente

### Las coordenadas no se actualizan
- Limpia la caché del navegador
- Recarga la página con Ctrl+F5
- Verifica que JavaScript esté habilitado

### Error al guardar la ubicación
- Verifica que el servidor backend esté ejecutándose
- Comprueba la configuración de CORS
- Revisa los logs del servidor para más detalles

### La búsqueda de direcciones no funciona
- La API de Nominatim tiene límites de uso
- Espera unos segundos entre búsquedas
- Intenta con una dirección más específica

## 📊 Estructura de la Base de Datos

```sql
CREATE TABLE locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🎯 Próximas Mejoras

- [ ] Autenticación y autorización
- [ ] Subir imágenes de las ubicaciones
- [ ] Horarios de atención
- [ ] Información de contacto
- [ ] Edición de ubicaciones existentes
- [ ] Eliminación de ubicaciones
- [ ] Filtros y búsqueda de ubicaciones
- [ ] Vista previa antes de guardar
- [ ] Validación de ubicaciones duplicadas

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo de VerdeGo.
