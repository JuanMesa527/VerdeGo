# 📁 Estructura del Proyecto VerdeGo - Frontend

## 🎨 Organización Profesional

```
frontend/
├── index.html                      # Página principal
├── pages/                          # Páginas de la aplicación
│   ├── login.html                 # Inicio de sesión
│   ├── register.html              # Registro de usuarios
│   └── user/                      # Páginas del usuario autenticado
│       ├── account.html           # 👤 Mi Cuenta (perfil e insignias)
│       ├── bonuses.html           # 🎁 Mis Bonos (próximamente)
│       └── recharges.html         # 💳 Mis Recargas (próximamente)
│
└── public/                         # Recursos públicos
    ├── assets/                     # Imágenes y recursos
    │   └── logo.jpg
    │
    ├── css/                        # Estilos CSS
    │   ├── style.css              # Estilos globales
    │   ├── auth.css               # Estilos de autenticación
    │   └── pages/                 # Estilos por página
    │       └── account.css        # Estilos de Mi Cuenta
    │
    └── js/                         # JavaScript
        ├── auth.js                 # Sistema de autenticación
        ├── badges.js               # Sistema de insignias
        └── pages/                  # Scripts por página
            └── account.js          # Lógica de Mi Cuenta
```

## 🏆 Sistema de Insignias

### Niveles de Insignias (por puntos):

| Insignia | Icono | Rango de Puntos | Color |
|----------|-------|-----------------|-------|
| **Reciclador Novato** | 🌱 | 0 - 99 | Gris |
| **Recolector Ecológico** | ♻️ | 100 - 299 | Cian |
| **Guardian Ambiental** | 🛡️ | 300 - 599 | Verde |
| **Héroe Verde** | 🦸 | 600 - 999 | Amarillo |
| **Leyenda del Planeta** | 👑 | 1000+ | Rojo |

### Características del sistema:
- ✅ Insignia actual del usuario
- ✅ Progreso hacia la siguiente insignia
- ✅ Vista de todas las insignias (desbloqueadas y bloqueadas)
- ✅ Descripción de cada nivel
- ✅ Barra de progreso visual

## 👤 Página "Mi Cuenta"

### Secciones implementadas:

1. **Perfil del Usuario**
   - Foto de perfil (avatar con iniciales)
   - Nombre completo
   - Correo electrónico
   - Puntos acumulados
   - Fecha de registro

2. **Insignia Actual**
   - Insignia desbloqueada del usuario
   - Descripción del nivel
   - Diseño con gradiente personalizado

3. **Progreso**
   - Barra de progreso hacia la siguiente insignia
   - Puntos necesarios para el siguiente nivel
   - Vista previa de la siguiente insignia

4. **Sistema de Insignias**
   - Grid con todas las insignias
   - Estado (desbloqueada/bloqueada)
   - Rango de puntos requerido

5. **Información de la Cuenta**
   - Cédula
   - Nombre completo
   - Correo electrónico
   - Total de puntos

## 🎨 Características de Diseño

- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Gradientes y colores modernos
- ✅ Animaciones suaves
- ✅ Sidebar de navegación
- ✅ Tarjetas con sombras
- ✅ Iconos emoji integrados

## 🚀 Próximas Funcionalidades

- [ ] Página "Mis Bonos"
- [ ] Página "Mis Recargas"
- [ ] Subida de foto de perfil
- [ ] Edición de datos personales
- [ ] Historial de puntos
- [ ] Notificaciones de nuevas insignias

## 📝 Notas de Desarrollo

- Todos los estilos están modularizados por página
- Sistema de insignias centralizado en `badges.js`
- Autenticación protegida con JWT
- Datos en localStorage para persistencia
