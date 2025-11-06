// ============================================
// CONFIGURACIÓN DE BASE DE DATOS SQLite3
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta a la base de datos desde variable de entorno o usar default
let DB_PATH;
if (process.env.DB_PATH) {
    // Si la ruta es absoluta, usarla directamente, si no, resolver relativa a la raíz del proyecto
    DB_PATH = path.isAbsolute(process.env.DB_PATH)
        ? process.env.DB_PATH
        : path.join(__dirname, '../../', process.env.DB_PATH);
} else {
    DB_PATH = path.join(__dirname, '../../database/database.db');
}

// Asegurar que el directorio de la BD exista (evita errores de "unable to open database file")
const dbDir = path.dirname(DB_PATH);
try {
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('✅ Directorio de base de datos creado en:', dbDir);
    }
} catch (mkdirErr) {
    console.error('❌ Error al crear directorio de la base de datos:', mkdirErr.message);
}

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
            referral_code TEXT UNIQUE,
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

            // Agregar columna referral_code si no existe (migración segura)
            db.run(`ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE`, (alterErr2) => {
                if (alterErr2) {
                    if (alterErr2.message.includes('duplicate column name')) {
                        console.log('✅ Columna referral_code ya existe');
                    }
                } else {
                    console.log('✅ Columna referral_code agregada');
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

    // Tabla de referrals para registrar eventos de referido
    db.run(`
        CREATE TABLE IF NOT EXISTS referrals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            referrer_id INTEGER NOT NULL,
            referred_id INTEGER NOT NULL,
            code_used TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (referrer_id) REFERENCES users(id),
            FOREIGN KEY (referred_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla referrals:', err.message);
        } else {
            console.log('✅ Tabla referrals verificada/creada');
        }
    });

    // Tabla de competencias
    db.run(`
        CREATE TABLE IF NOT EXISTS competitions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            status TEXT DEFAULT 'active',
            reward_percentage INTEGER DEFAULT 10,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla competitions:', err.message);
        } else {
            console.log('✅ Tabla competitions verificada/creada');
        }
    });

    // Tabla de universidades
    db.run(`
        CREATE TABLE IF NOT EXISTS universities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            logo TEXT NOT NULL,
            total_points INTEGER DEFAULT 0,
            color TEXT DEFAULT '#4CAF50',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla universities:', err.message);
        } else {
            console.log('✅ Tabla universities verificada/creada');
        }
        
        // Agregar columnas si no existen (migración segura)
        db.run(`ALTER TABLE universities ADD COLUMN logo TEXT DEFAULT '🎓'`, (alterErr) => {
            if (alterErr && !alterErr.message.includes('duplicate column')) {
                console.error('⚠️  Error al agregar columna logo:', alterErr.message);
            } else if (!alterErr) {
                console.log('✅ Columna logo agregada');
            }
        });
        
        db.run(`ALTER TABLE universities ADD COLUMN color TEXT DEFAULT '#4CAF50'`, (alterErr) => {
            if (alterErr && !alterErr.message.includes('duplicate column')) {
                console.error('⚠️  Error al agregar columna color:', alterErr.message);
            } else if (!alterErr) {
                console.log('✅ Columna color agregada');
            }
        });
        
        // Esperar un momento para que se agreguen las columnas antes de insertar
        setTimeout(() => {
            // Insertar universidades por defecto
            const defaultUniversities = [
                { name: 'Universidad Nacional de Colombia', logo: '🎓', color: '#DC143C' },
                { name: 'Universidad de los Andes', logo: '🏔️', color: '#FFD700' },
                { name: 'Universidad Javeriana', logo: '⚡', color: '#0066CC' },
                { name: 'Universidad del Rosario', logo: '🌹', color: '#8B0000' },
                { name: 'Universidad de Antioquia', logo: '🦌', color: '#228B22' }
            ];

            defaultUniversities.forEach(uni => {
                db.run(`INSERT OR IGNORE INTO universities (name, logo, color) VALUES (?, ?, ?)`,
                    [uni.name, uni.logo, uni.color],
                    (insertErr) => {
                        if (insertErr && !insertErr.message.includes('UNIQUE constraint')) {
                            console.error(`❌ Error al insertar universidad ${uni.name}:`, insertErr.message);
                        }
                    }
                );
            });
        }, 100);
    });

    // Tabla de contribuciones a universidades
    db.run(`
        CREATE TABLE IF NOT EXISTS university_contributions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            university_id INTEGER NOT NULL,
            competition_id INTEGER NOT NULL,
            points_contributed INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (university_id) REFERENCES universities(id),
            FOREIGN KEY (competition_id) REFERENCES competitions(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla university_contributions:', err.message);
        } else {
            console.log('✅ Tabla university_contributions verificada/creada');
        }
    });

    // Tabla de recompensas de competencias
    db.run(`
        CREATE TABLE IF NOT EXISTS competition_rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            competition_id INTEGER NOT NULL,
            university_id INTEGER NOT NULL,
            points_contributed INTEGER NOT NULL,
            reward_points INTEGER NOT NULL,
            university_rank INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (competition_id) REFERENCES competitions(id),
            FOREIGN KEY (university_id) REFERENCES universities(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla competition_rewards:', err.message);
        } else {
            console.log('✅ Tabla competition_rewards verificada/creada');
        }
    });
}

// Inicializar la base de datos
initializeDatabase();

module.exports = db;
