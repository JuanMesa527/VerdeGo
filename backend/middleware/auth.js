// ============================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ============================================

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// Middleware para verificar JWT en rutas protegidas
function verificarToken(req, res, next) {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
    
    console.log('🔍 Verificando token...');
    
    if (!token) {
        console.log('❌ No se proporcionó token');
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    // Verificar el token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('❌ Token inválido o expirado:', err.message);
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        
        console.log('✅ Token válido para usuario:', decoded.email);
        
        // Guardar los datos del usuario en req.user para usarlos en las rutas
        req.user = decoded;
        next(); // Continuar con la siguiente función (la ruta)
    });
}

module.exports = { verificarToken };
