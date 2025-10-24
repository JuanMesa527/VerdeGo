// ============================================
// CONTROLADOR DE TRANSACCIONES
// ============================================

const db = require('../config/database');

// Crear nueva transacción
function createTransaction(req, res) {
    const { user_id, location_id, type, amount } = req.body;
    
    if (!user_id || !location_id || !type || !amount) {
        return res.status(400).json({ 
            error: 'Faltan campos: user_id, location_id, type, amount son obligatorios' 
        });
    }
    
    // Verificar que el usuario existe
    const sqlVerificar = 'SELECT id FROM users WHERE id = ?';
    
    db.get(sqlVerificar, [user_id], (err, user) => {
        if (err) {
            console.log('❌ Error al verificar usuario:', err.message);
            return res.status(500).json({ error: 'Error al verificar usuario' });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Usuario existe, crear transacción
        const sqlInsertar = `
            INSERT INTO transactions (user_id, location_id, type, amount) 
            VALUES (?, ?, ?, ?)
        `;
        
        db.run(sqlInsertar, [user_id, location_id, type, amount], function(err) {
            if (err) {
                console.log('❌ Error al crear transacción:', err.message);
                return res.status(500).json({ error: 'Error al crear transacción' });
            }
            
            console.log('✅ Transacción creada con ID:', this.lastID);
            
            res.status(201).json({
                mensaje: 'Transacción creada exitosamente',
                transaction: {
                    id: this.lastID,
                    user_id,
                    location_id,
                    type,
                    amount
                }
            });
        });
    });
}

// Obtener todas las transacciones
function getAllTransactions(req, res) {
    const sql = `
        SELECT 
            transactions.*,
            users.name as user_name,
            users.surname as user_surname,
            users.email as user_email,
            locations.name as location_name
        FROM transactions
        LEFT JOIN users ON transactions.user_id = users.id
        LEFT JOIN locations ON transactions.location_id = locations.id
        ORDER BY transactions.created_at DESC
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({
            mensaje: 'Transacciones obtenidas',
            total: rows.length,
            transactions: rows
        });
    });
}

module.exports = {
    createTransaction,
    getAllTransactions
};
