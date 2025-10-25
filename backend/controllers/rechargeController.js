// ============================================
// CONTROLADOR DE RECARGAS TULLAVE
// ============================================

const db = require('../config/database');

// ============================================
// CREAR UNA NUEVA RECARGA
// ============================================
exports.createRecharge = (req, res) => {
    const { userId, cardNumber, amount, pointsUsed, transactionId } = req.body;

    console.log('📥 Datos recibidos para recarga:', {
        userId,
        cardNumber,
        amount: amount,
        amountType: typeof amount,
        pointsUsed,
        transactionId
    });

    // Validar datos requeridos
    if (!userId || !cardNumber || amount === undefined || amount === null || !pointsUsed || !transactionId) {
        return res.status(400).json({ 
            error: 'Faltan datos requeridos',
            required: ['userId', 'cardNumber', 'amount', 'pointsUsed', 'transactionId'],
            received: { userId, cardNumber, amount, pointsUsed, transactionId }
        });
    }

    // Convertir amount a número si viene como string
    const amountNumber = typeof amount === 'string' ? parseInt(amount) : amount;
    
    if (isNaN(amountNumber)) {
        return res.status(400).json({ 
            error: 'Monto inválido. Debe ser un número',
            received: amount
        });
    }

    // Validar formato de tarjeta
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        return res.status(400).json({ 
            error: 'Número de tarjeta inválido. Debe tener 16 dígitos'
        });
    }

    // Validar rango de monto
    if (amountNumber < 100 || amountNumber > 10000) {
        return res.status(400).json({ 
            error: 'Monto inválido. Debe estar entre $100 y $10,000 COP'
        });
    }

    // Validar que los puntos sean positivos
    if (pointsUsed <= 0) {
        return res.status(400).json({ 
            error: 'Los puntos usados deben ser mayores a 0'
        });
    }

    // Insertar recarga en la base de datos
    const query = `
        INSERT INTO recharges (user_id, card_number, amount, points_used, transaction_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [userId, cardNumber, amountNumber, pointsUsed, transactionId], function(err) {
        if (err) {
            console.error('❌ Error al guardar recarga:', err.message);
            return res.status(500).json({ 
                error: 'Error al procesar la recarga',
                details: err.message 
            });
        }

        console.log('✅ Recarga creada exitosamente:', {
            id: this.lastID,
            userId,
            cardNumber,
            amount: amountNumber,
            pointsUsed,
            transactionId
        });

        res.status(201).json({
            message: 'Recarga procesada exitosamente',
            recharge: {
                id: this.lastID,
                userId,
                cardNumber,
                amount: amountNumber,
                pointsUsed,
                transactionId,
                createdAt: new Date().toISOString()
            }
        });
    });
};

// ============================================
// OBTENER RECARGAS DE UN USUARIO
// ============================================
exports.getUserRecharges = (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ 
            error: 'Se requiere el ID del usuario' 
        });
    }

    const query = `
        SELECT 
            id,
            card_number,
            amount,
            points_used,
            transaction_id,
            created_at
        FROM recharges
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('❌ Error al obtener recargas:', err.message);
            return res.status(500).json({ 
                error: 'Error al obtener las recargas',
                details: err.message 
            });
        }

        console.log(`📊 Recargas encontradas para usuario ${userId}:`, rows.length);

        res.json({
            recharges: rows,
            total: rows.length
        });
    });
};

// ============================================
// OBTENER ESTADÍSTICAS DE RECARGAS
// ============================================
exports.getRechargeStats = (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ 
            error: 'Se requiere el ID del usuario' 
        });
    }

    const query = `
        SELECT 
            COUNT(*) as total_recharges,
            SUM(amount) as total_amount,
            SUM(points_used) as total_points_used,
            MIN(created_at) as first_recharge,
            MAX(created_at) as last_recharge
        FROM recharges
        WHERE user_id = ?
    `;

    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error('❌ Error al obtener estadísticas:', err.message);
            return res.status(500).json({ 
                error: 'Error al obtener estadísticas',
                details: err.message 
            });
        }

        console.log(`📊 Estadísticas de recargas para usuario ${userId}:`, row);

        res.json({
            stats: {
                totalRecharges: row.total_recharges || 0,
                totalAmount: row.total_amount || 0,
                totalPointsUsed: row.total_points_used || 0,
                firstRecharge: row.first_recharge,
                lastRecharge: row.last_recharge
            }
        });
    });
};

// ============================================
// VERIFICAR DISPONIBILIDAD DE PUNTOS
// ============================================
exports.checkPointsAvailability = (req, res) => {
    const { userId, pointsNeeded } = req.body;

    if (!userId || !pointsNeeded) {
        return res.status(400).json({ 
            error: 'Se requiere userId y pointsNeeded' 
        });
    }

    const query = `SELECT credits FROM users WHERE id = ?`;

    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error('❌ Error al verificar puntos:', err.message);
            return res.status(500).json({ 
                error: 'Error al verificar disponibilidad',
                details: err.message 
            });
        }

        if (!row) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        const available = row.credits >= pointsNeeded;

        res.json({
            available,
            currentPoints: row.credits,
            pointsNeeded,
            remaining: row.credits - pointsNeeded
        });
    });
};
