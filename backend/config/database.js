// ============================================
// CONFIGURACIÓN DE BASE DE DATOS SQLite
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos desde variable de entorno o usar default
const DB_PATH = process.env.DB_PATH 
    ? path.join(__dirname, '../../', process.env.DB_PATH)
    : path.join(__dirname, '../../database/database.db');

// Crear conexión a la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite en:', DB_PATH);
    }
});

// Habilitar claves foráneas (SQLite las desactiva por defecto)
db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) {
        console.error('❌ Error al habilitar foreign keys:', err.message);
    } else {
        console.log('✅ Foreign keys habilitadas');
    }
});

// Crear las tablas si no existen
function initializeDatabase() {
    // Tabla de rangos
    db.run(`
        CREATE TABLE IF NOT EXISTS ranks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            min_credits INTEGER NOT NULL,
            max_credits INTEGER NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla ranks:', err.message);
        } else {
            console.log('✅ Tabla ranks verificada/creada');
        }
    });

    // Tabla de usuarios
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            credits INTEGER DEFAULT 0,
            total_earned INTEGER DEFAULT 0,
            rank_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (rank_id) REFERENCES ranks(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla users:', err.message);
        } else {
            console.log('✅ Tabla users verificada/creada');
            
            // Agregar columna total_earned si no existe (migración segura)
            db.run(`ALTER TABLE users ADD COLUMN total_earned INTEGER DEFAULT 0`, (alterErr) => {
                if (alterErr) {
                    // La columna ya existe, no es un error
                    if (alterErr.message.includes('duplicate column name')) {
                        console.log('✅ Columna total_earned ya existe');
                    }
                } else {
                    console.log('✅ Columna total_earned agregada');
                    
                    // Inicializar total_earned con credits actuales para usuarios existentes
                    db.run(`UPDATE users SET total_earned = credits WHERE total_earned = 0`, (updateErr) => {
                        if (!updateErr) {
                            console.log('✅ total_earned inicializado para usuarios existentes');
                        }
                    });
                }
            });
        }
    });

    // Tabla de ubicaciones
    db.run(`
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla locations:', err.message);
        } else {
            console.log('✅ Tabla locations verificada/creada');
        }
    });

    // Tabla de transacciones
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            location_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            amount INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (location_id) REFERENCES locations(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla transactions:', err.message);
        } else {
            console.log('✅ Tabla transactions verificada/creada');
        }
    });

    // Tabla de bonos canjeados
    db.run(`
        CREATE TABLE IF NOT EXISTS redeemed_bonuses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            bonus_id TEXT NOT NULL,
            bonus_brand TEXT NOT NULL,
            bonus_value TEXT NOT NULL,
            bonus_icon TEXT NOT NULL,
            bonus_category TEXT NOT NULL,
            points_cost INTEGER NOT NULL,
            bonus_code TEXT NOT NULL,
            redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla redeemed_bonuses:', err.message);
        } else {
            console.log('✅ Tabla redeemed_bonuses verificada/creada');
        }
    });

    // Tabla de recargas TuLlave
    db.run(`
        CREATE TABLE IF NOT EXISTS recharges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            card_number TEXT NOT NULL,
            amount INTEGER NOT NULL,
            points_used INTEGER NOT NULL,
            transaction_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla recharges:', err.message);
        } else {
            console.log('✅ Tabla recharges verificada/creada');
        }
    });
}

// Inicializar la base de datos
initializeDatabase();

module.exports = db;
