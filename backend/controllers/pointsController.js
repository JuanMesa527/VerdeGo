// ============================================
// CONTROLADOR DE PUNTOS (SIMULACIÓN)
// ============================================

const db = require('../config/database');

// Actualizar puntos de un usuario
function updateUserPoints(req, res) {
    const { userId, pointsToAdd } = req.body;
    
    console.log('📥 Solicitud de actualización de puntos:');
    console.log('   - Usuario ID:', userId);
    console.log('   - Puntos a agregar:', pointsToAdd);
    console.log('   - Usuario autenticado:', req.user?.email);
    
    if (!userId || pointsToAdd === undefined) {
        console.log('❌ Faltan datos requeridos');
        return res.status(400).json({ error: 'userId y pointsToAdd son requeridos' });
    }
    
    // Permitir puntos negativos para canjear bonos
    // Ya no validamos que los puntos sean negativos aquí
    
    // Obtener puntos actuales del usuario
    const sqlGet = 'SELECT id, credits, total_earned FROM users WHERE id = ?';
    
    db.get(sqlGet, [userId], (err, user) => {
        if (err) {
            console.error('❌ Error al obtener usuario:', err.message);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (!user) {
            console.log('❌ Usuario no encontrado:', userId);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        console.log('👤 Usuario encontrado - Puntos actuales:', user.credits || 0);
        console.log('📊 Total histórico:', user.total_earned || 0);
        
        const currentPoints = user.credits || 0;
        const currentTotalEarned = user.total_earned || 0;
        const newTotal = currentPoints + pointsToAdd;
        
        // Validar que no quede en negativo
        if (newTotal < 0) {
            console.log('❌ El resultado sería negativo:', newTotal);
            return res.status(400).json({ 
                error: 'Puntos insuficientes',
                currentPoints: currentPoints,
                required: Math.abs(pointsToAdd),
                missing: Math.abs(newTotal)
            });
        }
        
        // Calcular nuevo total_earned (solo se suma cuando pointsToAdd es positivo)
        let newTotalEarned = currentTotalEarned;
        if (pointsToAdd > 0) {
            newTotalEarned = currentTotalEarned + pointsToAdd;
        }
        
        // Actualizar puntos y total_earned
        const sqlUpdate = 'UPDATE users SET credits = ?, total_earned = ? WHERE id = ?';
        
        db.run(sqlUpdate, [newTotal, newTotalEarned, userId], function(err) {
            if (err) {
                console.error('❌ Error al actualizar puntos:', err.message);
                return res.status(500).json({ error: 'Error al actualizar puntos' });
            }
            
            console.log(`✅ Puntos actualizados exitosamente!`);
            console.log(`   - Usuario ID: ${userId}`);
            console.log(`   - Puntos anteriores: ${currentPoints}`);
            console.log(`   - Puntos agregados: ${pointsToAdd}`);
            console.log(`   - Nuevo total: ${newTotal}`);
            console.log(`   - Total histórico: ${currentTotalEarned} → ${newTotalEarned}`);
            console.log(`   - Filas afectadas: ${this.changes}`);
            
            res.json({
                mensaje: 'Puntos actualizados exitosamente',
                userId: userId,
                previousTotal: currentPoints,
                pointsAdded: pointsToAdd,
                newTotal: newTotal,
                totalEarned: newTotalEarned
            });
        });
    });
}

// Obtener puntos de un usuario
function getUserPoints(req, res) {
    const userId = req.params.userId;
    
    const sql = 'SELECT id, name, surname, email, credits, total_earned FROM users WHERE id = ?';
    
    db.get(sql, [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({
            user: user,
            credits: user.credits || 0,
            totalEarned: user.total_earned || 0
        });
    });
}

module.exports = {
    updateUserPoints,
    getUserPoints
};
