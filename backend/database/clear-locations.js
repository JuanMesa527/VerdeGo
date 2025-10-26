// ============================================
// SCRIPT PARA LIMPIAR UBICACIONES
// ============================================

const db = require('../config/database');

function clearLocations() {
    console.log('🗑️  Limpiando ubicaciones existentes...');

    db.run('DELETE FROM locations', (err) => {
        if (err) {
            console.error('❌ Error al limpiar ubicaciones:', err.message);
        } else {
            console.log('✅ Todas las ubicaciones han sido eliminadas');
            
            // Reiniciar el contador de IDs
            db.run('DELETE FROM sqlite_sequence WHERE name="locations"', (seqErr) => {
                if (seqErr) {
                    console.log('⚠️  Advertencia al reiniciar secuencia:', seqErr.message);
                } else {
                    console.log('✅ Contador de IDs reiniciado');
                }
                
                console.log('\n🎉 Base de datos limpia. Ahora puedes ejecutar seed-locations.js');
                db.close();
            });
        }
    });
}

// Ejecutar el script
clearLocations();
