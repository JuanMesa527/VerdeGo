# 🚌 Sistema de Recargas TuLlave - VerdeGo

## 📋 Descripción

El sistema de recargas TuLlave permite a los usuarios de VerdeGo convertir sus puntos ganados por reciclar en saldo para su tarjeta de transporte público TuLlave (Bogotá).

## 💰 Conversión de Puntos

- **Tasa de conversión**: 1 punto = $10 COP
- **Recarga mínima**: $100 COP (10 puntos)
- **Recarga máxima**: $10,000 COP (1,000 puntos)

## 🎯 Características

### Frontend
- ✅ Formulario de recarga con validación en tiempo real
- ✅ Botones rápidos para montos predefinidos ($1,000, $2,000, $5,000, $10,000)
- ✅ Cálculo automático de puntos necesarios
- ✅ Validación de número de tarjeta (16 dígitos con formato automático)
- ✅ Formato automático de tarjeta (XXXX XXXX XXXX XXXX)
- ✅ Modal de confirmación con desglose completo
- ✅ Modal de éxito con ID de transacción
- ✅ Historial completo de recargas realizadas
- ✅ Display de puntos disponibles y máximo recargable
- ✅ Diseño responsive para móviles

### Backend
- ✅ Tabla `recharges` en SQLite
- ✅ Controlador `rechargeController.js` con 4 endpoints
- ✅ Validación de datos (rango, formato, puntos disponibles)
- ✅ Autenticación con JWT
- ✅ Generación de ID único de transacción
- ✅ Registro detallado con timestamps

## 🗄️ Base de Datos

### Tabla: recharges

```sql
CREATE TABLE recharges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    card_number TEXT NOT NULL,
    amount INTEGER NOT NULL,
    points_used INTEGER NOT NULL,
    transaction_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
```

## 🔌 API Endpoints

### 1. Crear Recarga
```
POST /api/crear-recarga
Headers: Authorization: Bearer {token}
Body: {
  userId: number,
  cardNumber: string (16 dígitos),
  amount: number (100-10000),
  pointsUsed: number,
  transactionId: string
}
```

**Validaciones:**
- Tarjeta debe tener exactamente 16 dígitos numéricos
- Monto debe estar entre $100 y $10,000 COP
- Puntos usados deben ser positivos
- Usuario debe tener puntos suficientes

### 2. Obtener Recargas de Usuario
```
GET /api/recargas/:userId
Response: {
  recharges: [
    {
      id: number,
      card_number: string,
      amount: number,
      points_used: number,
      transaction_id: string,
      created_at: datetime
    }
  ],
  total: number
}
```

### 3. Estadísticas de Recargas
```
GET /api/estadisticas-recargas/:userId
Response: {
  stats: {
    totalRecharges: number,
    totalAmount: number,
    totalPointsUsed: number,
    firstRecharge: datetime,
    lastRecharge: datetime
  }
}
```

### 4. Verificar Disponibilidad de Puntos
```
POST /api/verificar-puntos
Body: {
  userId: number,
  pointsNeeded: number
}
Response: {
  available: boolean,
  currentPoints: number,
  pointsNeeded: number,
  remaining: number
}
```

## 📁 Estructura de Archivos

```
frontend/
  pages/
    user/
      recharges.html          # Página principal de recargas
  public/
    css/
      pages/
        recharges.css         # Estilos completos (528 líneas)
    js/
      pages/
        recharges.js          # Lógica de negocio (400+ líneas)
      auth.js                 # Actualizado con navegación

backend/
  controllers/
    rechargeController.js     # Controlador con 4 funciones
  config/
    database.js               # Tabla recharges agregada
  server.js                   # 4 rutas nuevas agregadas
```

## 🔄 Flujo de Recarga

1. **Usuario ingresa datos**
   - Número de tarjeta (8 dígitos)
   - Monto a recargar ($100 - $10,000)

2. **Cálculo automático**
   - Sistema calcula puntos necesarios
   - Valida puntos disponibles
   - Muestra saldo restante

3. **Confirmación**
   - Modal con desglose completo
   - Usuario confirma la operación

4. **Procesamiento**
   - Descuenta puntos vía `/api/actualizar-puntos`
   - Guarda recarga en BD vía `/api/crear-recarga`
   - Genera ID único de transacción

5. **Confirmación**
   - Modal de éxito con detalles
   - Actualiza historial
   - Actualiza puntos en UI

## 🎨 Diseño Visual

- **Tema**: Gradiente verde eco (#11998e → #38ef7d)
- **Tarjeta TuLlave**: Gradiente púrpura (#667eea → #764ba2)
- **Animaciones**: Hover effects, modales con slideIn y bounce
- **Responsive**: Grid adaptativo para botones rápidos
- **Estados**: Loading, success, error, empty state

## ⚠️ Validaciones

### Frontend
- Número de tarjeta: 16 dígitos numéricos con formato automático (XXXX XXXX XXXX XXXX)
- Monto: min $100, max $10,000, steps de $100
- Puntos suficientes para la recarga
- Campos requeridos antes de enviar

### Backend
- Formato de tarjeta: `/^\d{16}$/`
- Rango de monto: 100 ≤ amount ≤ 10000
- Puntos positivos: pointsUsed > 0
- Token JWT válido
- Usuario existe en BD

## 🔐 Seguridad

- Autenticación JWT en todas las rutas de escritura
- Validación de datos en frontend y backend
- Sanitización de inputs numéricos
- Foreign keys para integridad referencial
- Logs detallados para auditoría

## 🚀 Uso

1. Iniciar sesión en VerdeGo
2. Navegar a "Mis Recargas" desde el menú de usuario
3. Ingresar número de tarjeta TuLlave (16 dígitos, se formatea automáticamente)
4. Seleccionar o ingresar monto deseado
5. Revisar cálculo de puntos
6. Confirmar recarga
7. Recibir ID de transacción

## 📊 Métricas Disponibles

- Total de recargas realizadas
- Monto total recargado (COP)
- Puntos totales usados en recargas
- Primera y última recarga
- Historial completo con fechas

## 🔮 Mejoras Futuras

- [ ] Integración real con API de TransMilenio
- [ ] Notificaciones push cuando recarga esté lista
- [ ] QR code para vincular tarjeta automáticamente
- [ ] Recarga automática programada
- [ ] Descuentos por volumen de recargas
- [ ] Soporte para otras tarjetas de transporte (SITP)

## 📝 Notas Técnicas

- Los puntos usados NO afectan `total_earned` (solo para badges)
- Las recargas se registran instantáneamente
- El historial se ordena por fecha descendente
- IDs de transacción: formato `TL{timestamp}{random}`
- Compatible con Chrome, Firefox, Safari, Edge

## 🐛 Debugging

Si hay problemas:
1. Verificar que el servidor esté corriendo
2. Revisar console de navegador (logs detallados)
3. Verificar que la tabla `recharges` exista en BD
4. Confirmar que el usuario tenga puntos suficientes
5. Validar formato de número de tarjeta

## 👥 Uso del Sistema

**Ejemplo:**
- Usuario tiene: 438 puntos
- Quiere recargar: $2,000 COP
- Tarjeta: 1234 5678 9012 3456
- Necesita: 200 puntos
- Le quedarán: 238 puntos
- ID generado: TL17123456789012345

---

**Desarrollado para VerdeGo - Sistema de Reciclaje Inteligente** 🌿
