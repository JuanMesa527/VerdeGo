// ============================================
// CONTROLADOR DE AUTENTICACIÓN
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET, JWT_OPTIONS } = require('../config/jwt');

// Registrar nuevo usuario
async function register(req, res) {
    const { id, name, surname, email, password } = req.body;
    
    // Validaciones
    if (!id || !name || !surname || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios: id (cédula), name, surname, email, password' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    try {
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insertar usuario en la base de datos
        const sql = 'INSERT INTO users (id, name, surname, email, password) VALUES (?, ?, ?, ?, ?)';
        
        db.run(sql, [id, name, surname, email, hashedPassword], function(err) {
            if (err) {
                console.log('❌ Error al crear usuario:', err.message);
                
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'El email o cédula ya está registrado' });
                }
                
                return res.status(500).json({ error: 'Error al crear usuario' });
            }
            
            console.log('✅ Usuario creado:', email);
            
            res.status(201).json({
                mensaje: 'Usuario creado exitosamente',
                user: {
                    id: id,
                    name: name,
                    surname: surname,
                    email: email
                }
            });
        });
    } catch (error) {
        console.log('❌ Error en registro:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

// Iniciar sesión
async function login(req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }
    
    // Buscar usuario por email
    const sql = `
        SELECT 
            users.id,
            users.name,
            users.surname,
            users.email, 
            users.password,
            users.credits,
            ranks.name as rank_name
        FROM users
        LEFT JOIN ranks ON users.rank_id = ranks.id
        WHERE users.email = ?
    `;
    
    db.get(sql, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        try {
            // Comparar contraseña
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            console.log('🔑 Intentando login:', email);
            console.log('✅ Contraseña correcta:', passwordMatch);
            
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            // Generar JWT token
            const tokenPayload = {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                rank: user.rank_name
            };
            
            const token = jwt.sign(tokenPayload, JWT_SECRET, JWT_OPTIONS);
            
            console.log('🎫 Token generado para:', email);
            
            // Login exitoso
            res.json({
                mensaje: 'Login exitoso',
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    credits: user.credits,
                    rank_name: user.rank_name
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al verificar contraseña' });
        }
    });
}

// Verificar token
function verifyToken(req, res) {
    res.json({
        mensaje: 'Token válido',
        user: req.user
    });
}

// Obtener perfil del usuario autenticado
function getProfile(req, res) {
    const userId = req.user.id;
    
    const sql = `
        SELECT 
            users.id, 
            users.name,
            users.surname,
            users.email, 
            users.credits,
            users.created_at,
            ranks.name as rank_name,
            ranks.min_credits,
            ranks.max_credits
        FROM users
        LEFT JOIN ranks ON users.rank_id = ranks.id
        WHERE users.id = ?
    `;
    
    db.get(sql, [userId], (err, user) => {
        if (err) {
            console.log('❌ Error SQL:', err.message);
            return res.status(500).json({ error: 'Error en el servidor: ' + err.message });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({
            mensaje: 'Perfil obtenido',
            user: user
        });
    });
}

module.exports = {
    register,
    login,
    verifyToken,
    getProfile
};
