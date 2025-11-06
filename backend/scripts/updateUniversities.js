// Script para actualizar universidades existentes con logos y colores
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/database.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔄 Actualizando universidades...\n');

const universities = [
    { name: 'Universidad Nacional de Colombia', logo: '🎓', color: '#DC143C' },
    { name: 'Universidad de los Andes', logo: '🏔️', color: '#FFD700' },
    { name: 'Universidad Javeriana', logo: '⚡', color: '#0066CC' },
    { name: 'Universidad del Rosario', logo: '🌹', color: '#8B0000' },
    { name: 'Universidad de Antioquia', logo: '🦌', color: '#228B22' },
    { name: 'Universidad Piloto de Colombia', logo: '✈️', color: '#FF6B00' }
];

db.serialize(() => {
    universities.forEach(uni => {
        // Primero verificar si existe
        db.get('SELECT id, name FROM universities WHERE name = ?', [uni.name], (err, row) => {
            if (err) {
                console.error(`❌ Error al buscar ${uni.name}:`, err.message);
                return;
            }
            
            if (row) {
                // Actualizar
                db.run('UPDATE universities SET logo = ?, color = ? WHERE name = ?',
                    [uni.logo, uni.color, uni.name],
                    (updateErr) => {
                        if (updateErr) {
                            console.error(`❌ Error al actualizar ${uni.name}:`, updateErr.message);
                        } else {
                            console.log(`✅ ${uni.logo} ${uni.name} - Actualizada`);
                        }
                    }
                );
            } else {
                // Insertar nueva
                db.run('INSERT INTO universities (name, logo, color, total_points) VALUES (?, ?, ?, 0)',
                    [uni.name, uni.logo, uni.color],
                    (insertErr) => {
                        if (insertErr) {
                            console.error(`❌ Error al insertar ${uni.name}:`, insertErr.message);
                        } else {
                            console.log(`✅ ${uni.logo} ${uni.name} - Insertada`);
                        }
                    }
                );
            }
        });
    });
    
    // Cerrar después de procesar todas
    setTimeout(() => {
        console.log('\n✅ Proceso completado');
        db.close();
    }, 500);
});
