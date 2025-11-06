// ============================================
// CONTROLADOR DE AUTENTICACIÓN
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const { JWT_SECRET, JWT_OPTIONS } = require('../config/jwt');

// Registrar nuevo usuario
async function register(req, res) {
    const { id, name, surname, email, password, referralCodeUsed } = req.body;
    
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

        // Generar un código de referido único para el nuevo usuario
        const referralCode = (crypto.randomBytes(4).toString('hex')).toUpperCase();

        // Insertar usuario en la base de datos (incluyendo referral_code)
        const sql = 'INSERT INTO users (id, name, surname, email, password, referral_code) VALUES (?, ?, ?, ?, ?, ?)';

        db.run(sql, [id, name, surname, email, hashedPassword, referralCode], function(err) {
            if (err) {
                console.log('❌ Error al crear usuario:', err.message);
                
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'El email o cédula ya está registrado' });
                }
                
                return res.status(500).json({ error: 'Error al crear usuario' });
            }
            
            console.log('✅ Usuario creado:', email);
            // Si se proporcionó un código de referido, intentar aplicarlo
            if (referralCodeUsed && typeof referralCodeUsed === 'string' && referralCodeUsed.trim() !== '') {
                const code = referralCodeUsed.trim();

                // Buscar al usuario que tiene ese código
                const findReferrerSql = 'SELECT id FROM users WHERE referral_code = ?';
                db.get(findReferrerSql, [code], (findErr, referrer) => {
                    if (findErr) {
                        console.log('❌ Error al buscar referrer:', findErr.message);
                    }

                    if (referrer && referrer.id && referrer.id != id) {
                        // Sumar 50 puntos al referrer
                        const updateSql = 'UPDATE users SET credits = credits + 50, total_earned = total_earned + 50 WHERE id = ?';
                        db.run(updateSql, [referrer.id], function(updateErr) {
                            if (updateErr) {
                                console.log('❌ Error al actualizar puntos del referrer:', updateErr.message);
                            } else {
                                console.log(`✅ Se otorgaron 50 puntos al referrer (id=${referrer.id}) por referido ${id}`);
                                // Registrar en tabla referrals
                                const insertReferral = 'INSERT INTO referrals (referrer_id, referred_id, code_used) VALUES (?, ?, ?)';
                                db.run(insertReferral, [referrer.id, id, code], function(insErr) {
                                    if (insErr) {
                                        console.log('❌ Error al registrar evento de referral:', insErr.message);
                                    }
                                });
                            }
                        });
                    } else {
                        if (!referrer) {
                            console.log('⚠️ Código de referido no válido o no encontrado:', code);
                        } else {
                            console.log('⚠️ Intento de usar código propio o inválido para referido:', code);
                        }
                    }
                });
            }

            res.status(201).json({
                mensaje: 'Usuario creado exitosamente',
                user: {
                    id: id,
                    name: name,
                    surname: surname,
                    email: email,
                    referral_code: referralCode
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
            users.referral_code,
            users.credits,
            users.total_earned,
            users.created_at,
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
                    rank_name: user.rank_name,
                    created_at: user.created_at,
                    referral_code: user.referral_code
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
            users.total_earned,
            users.referral_code,
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
