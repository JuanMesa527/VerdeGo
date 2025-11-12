// ============================================
// SCRIPT PARA INICIALIZAR MISIONES EN RAILWAY
// ============================================
// Este script crea las misiones semanales iniciales
// Ejecutar una sola vez después del deploy en Railway

const db = require('../config/database');

// Esperar a que las tablas se creen
setTimeout(() => {
    console.log('🚀 Iniciando creación de misiones para Railway...');
    
    // Importar la función de creación de misiones
    const { checkAndUpdateMissions } = require('../middleware/weeklyMissionsUpdate');
    
    // Ejecutar creación de misiones
    checkAndUpdateMissions()
        .then(() => {
            console.log('✅ Misiones inicializadas correctamente en Railway');
            console.log('📋 Puedes verificar en: https://verdego-production.up.railway.app/pages/user/missions.html');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Error al inicializar misiones:', err);
            process.exit(1);
        });
}, 2000); // Esperar 2 segundos para que las tablas se creen
