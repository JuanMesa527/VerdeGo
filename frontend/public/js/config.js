// ============================================
// CONFIGURACIÓN DE API - VerdeGo Frontend
// ============================================

// Detectar automáticamente el entorno y la URL de la API
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'  // Desarrollo local
    : `${window.location.origin}/api`;  // Producción (Railway u otro host)

console.log('🌐 API URL configurada:', API_URL);
