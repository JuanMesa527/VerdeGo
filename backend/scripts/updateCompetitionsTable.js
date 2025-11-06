// Script para actualizar tabla competitions
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/database.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔄 Actualizando tabla competitions...\n');

db.serialize(() => {
    // Agregar columna reward_percentage si no existe
    db.run(`ALTER TABLE competitions ADD COLUMN reward_percentage INTEGER DEFAULT 10`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) {
                console.log('✅ Columna reward_percentage ya existe');
            } else {
                console.error('❌ Error:', err.message);
            }
        } else {
            console.log('✅ Columna reward_percentage agregada');
        }
        
        db.close();
    });
});
