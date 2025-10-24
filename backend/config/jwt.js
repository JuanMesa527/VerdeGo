// ============================================
// CONFIGURACIÓN DE JWT
// ============================================

// Obtener valores desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Validar que JWT_SECRET esté configurado en producción
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('❌ ERROR: JWT_SECRET no está configurado en producción!');
    process.exit(1);
}

// Opciones de configuración
const JWT_OPTIONS = {
    expiresIn: JWT_EXPIRES_IN
};

module.exports = {
    JWT_SECRET,
    JWT_OPTIONS
};