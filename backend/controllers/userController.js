// ============================================
// CONTROLADOR DE USUARIOS
// ============================================

const db = require('../config/database');

// Obtener todos los usuarios
function getAllUsers(req, res) {
    const sql = `
        SELECT 
            users.id, 
            users.name,
            users.surname,
            users.email, 
            users.credits, 
            users.created_at,
            ranks.name as rank_name 
        FROM users
        LEFT JOIN ranks ON users.rank_id = ranks.id
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({
            mensaje: 'Usuarios obtenidos',
            total: rows.length,
            usuarios: rows
        });
    });
}

// Buscar usuario por email
function getUserByEmail(req, res) {
    const email = req.params.email;
    
    const sql = `
        SELECT 
            users.id, 
            users.name,
            users.surname,
            users.email, 
            users.credits,
            ranks.name as rank_name
        FROM users
        LEFT JOIN ranks ON users.rank_id = ranks.id
        WHERE users.email = ?
    `;
    
    db.get(sql, [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({
            mensaje: 'Usuario encontrado',
            usuario: row
        });
    });
}

// Eliminar usuario
function deleteUser(req, res) {
    const id = req.params.id;
    
    const sql = 'DELETE FROM users WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({
            mensaje: 'Usuario eliminado exitosamente',
            id: id
        });
    });
}

module.exports = {
    getAllUsers,
    getUserByEmail,
    deleteUser
};
