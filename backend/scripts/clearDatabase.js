// ============================================
// SCRIPT PARA VACIAR COMPLETAMENTE LA BASE DE DATOS
// ============================================

const db = require('../config/database');

console.log('🗑️  Iniciando limpieza de base de datos...');
console.log('⚠️  ADVERTENCIA: Se eliminarán TODOS los datos');
console.log('');

// Lista de tablas a limpiar
const tables = [
    'user_mission_progress',
    'weekly_missions',
    'competition_rewards',
    'university_contributions',
    'universities',
    'competitions',
    'redeemed_bonuses',
    'transactions',
    'referrals',
    'recharges',
    'users',
    'locations',
    'ranks'
];

let clearedCount = 0;

// Función para limpiar una tabla
function clearTable(tableName, callback) {
    db.run(`DELETE FROM ${tableName}`, (err) => {
        if (err) {
            console.error(`❌ Error al limpiar tabla ${tableName}:`, err.message);
        } else {
            console.log(`✅ Tabla ${tableName} limpiada`);
            clearedCount++;
        }
        callback();
    });
}

// Limpiar todas las tablas en secuencia
function clearAllTables(index = 0) {
    if (index >= tables.length) {
        // Reiniciar autoincrement
        console.log('');
        console.log('🔄 Reiniciando contadores de autoincrement...');
        
        db.run(`DELETE FROM sqlite_sequence`, (err) => {
            if (err) {
                console.error('❌ Error al reiniciar autoincrement:', err.message);
            } else {
                console.log('✅ Contadores reiniciados');
            }
            
            console.log('');
            console.log(`🎉 Proceso completado: ${clearedCount}/${tables.length} tablas limpiadas`);
            console.log('✨ Base de datos completamente vacía');
            
            db.close();
            process.exit(0);
        });
        return;
    }
    
    clearTable(tables[index], () => {
        clearAllTables(index + 1);
    });
}

// Iniciar limpieza
clearAllTables();
