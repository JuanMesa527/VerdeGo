const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database/database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Arreglando tabla university_contributions...\n');

// Verificar si la columna created_at existe
db.all('PRAGMA table_info(university_contributions)', (err, columns) => {
    if (err) {
        console.error('❌ Error:', err.message);
        db.close();
        return;
    }
    
    console.log('📋 Columnas actuales:');
    columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
    });
    
    const hasCreatedAt = columns.some(col => col.name === 'created_at');
    
    if (hasCreatedAt) {
        console.log('\n✅ La columna created_at ya existe');
        db.close();
    } else {
        console.log('\n⚠️  La columna created_at no existe. Agregándola...');
        
        db.run(`ALTER TABLE university_contributions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
            if (err) {
                console.error('❌ Error al agregar columna:', err.message);
            } else {
                console.log('✅ Columna created_at agregada exitosamente');
                
                // Actualizar registros existentes
                db.run(`UPDATE university_contributions SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`, (err) => {
                    if (err) {
                        console.error('❌ Error al actualizar registros:', err.message);
                    } else {
                        console.log('✅ Registros existentes actualizados');
                    }
                    db.close();
                });
            }
        });
    }
});
