// ============================================
// CONTROLADOR DE MISIONES SEMANALES
// ============================================

const db = require('../config/database');

// Obtener misiones activas
exports.getActiveMissions = (req, res) => {
    console.log('📋 Obteniendo misiones activas...');
    
    const today = new Date().toISOString().split('T')[0];
    
    const query = `
        SELECT * FROM weekly_missions 
        WHERE is_active = 1 
        AND date(start_date) <= date(?) 
        AND date(end_date) >= date(?)
        ORDER BY created_at DESC
    `;
    
    db.all(query, [today, today], (err, missions) => {
        if (err) {
            console.error('❌ Error al obtener misiones:', err.message);
            return res.status(500).json({ error: 'Error al obtener misiones' });
        }
        
        console.log(`✅ Misiones activas encontradas: ${missions.length}`);
        res.json(missions);
    });
};

// Obtener progreso de misiones del usuario
exports.getUserMissionProgress = (req, res) => {
    const userId = req.params.userId;
    console.log(`📊 Obteniendo progreso de misiones para usuario: ${userId}`);
    
    const today = new Date().toISOString().split('T')[0];
    
    const query = `
        SELECT 
            wm.*,
            ump.current_weight,
            ump.is_completed,
            ump.completed_at,
            CASE 
                WHEN ump.current_weight >= wm.target_weight THEN 1
                ELSE 0
            END as can_claim
        FROM weekly_missions wm
        LEFT JOIN user_mission_progress ump ON wm.id = ump.mission_id AND ump.user_id = ?
        WHERE wm.is_active = 1 
        AND date(wm.start_date) <= date(?) 
        AND date(wm.end_date) >= date(?)
        ORDER BY wm.created_at DESC
    `;
    
    db.all(query, [userId, today, today], (err, missions) => {
        if (err) {
            console.error('❌ Error al obtener progreso de misiones:', err.message);
            return res.status(500).json({ error: 'Error al obtener progreso de misiones' });
        }
        
        console.log(`✅ Progreso de misiones obtenido: ${missions.length} misiones`);
        res.json(missions);
    });
};

// Actualizar progreso de misión cuando el usuario recicla
exports.updateMissionProgress = (req, res) => {
    const { userId, materialType, weight } = req.body;
    
    console.log(`📈 Actualizando progreso de misiones - Usuario: ${userId}, Material: ${materialType}, Peso: ${weight}kg`);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Buscar misiones activas del tipo de material
    const queryMissions = `
        SELECT * FROM weekly_missions 
        WHERE is_active = 1 
        AND material_type = ?
        AND date(start_date) <= date(?) 
        AND date(end_date) >= date(?)
    `;
    
    db.all(queryMissions, [materialType, today, today], (err, missions) => {
        if (err) {
            console.error('❌ Error al buscar misiones:', err.message);
            return res.status(500).json({ error: 'Error al actualizar progreso' });
        }
        
        if (missions.length === 0) {
            console.log('ℹ️ No hay misiones activas para este material');
            return res.json({ message: 'No hay misiones activas para este material' });
        }
        
        // Actualizar o crear progreso para cada misión
        let updatedCount = 0;
        
        missions.forEach((mission, index) => {
            const checkQuery = `SELECT * FROM user_mission_progress WHERE user_id = ? AND mission_id = ?`;
            
            db.get(checkQuery, [userId, mission.id], (err, progress) => {
                if (err) {
                    console.error('❌ Error al verificar progreso:', err.message);
                    return;
                }
                
                if (progress) {
                    // Actualizar progreso existente
                    const newWeight = progress.current_weight + weight;
                    const updateQuery = `
                        UPDATE user_mission_progress 
                        SET current_weight = ? 
                        WHERE user_id = ? AND mission_id = ?
                    `;
                    
                    db.run(updateQuery, [newWeight, userId, mission.id], (err) => {
                        if (err) {
                            console.error('❌ Error al actualizar progreso:', err.message);
                        } else {
                            console.log(`✅ Progreso actualizado - Misión: ${mission.name}, Peso: ${newWeight}kg`);
                            updatedCount++;
                        }
                        
                        if (index === missions.length - 1) {
                            res.json({ 
                                message: 'Progreso actualizado', 
                                updated: updatedCount,
                                missions: missions.map(m => m.name)
                            });
                        }
                    });
                } else {
                    // Crear nuevo progreso
                    const insertQuery = `
                        INSERT INTO user_mission_progress (user_id, mission_id, current_weight)
                        VALUES (?, ?, ?)
                    `;
                    
                    db.run(insertQuery, [userId, mission.id, weight], (err) => {
                        if (err) {
                            console.error('❌ Error al crear progreso:', err.message);
                        } else {
                            console.log(`✅ Nuevo progreso creado - Misión: ${mission.name}, Peso: ${weight}kg`);
                            updatedCount++;
                        }
                        
                        if (index === missions.length - 1) {
                            res.json({ 
                                message: 'Progreso creado', 
                                updated: updatedCount,
                                missions: missions.map(m => m.name)
                            });
                        }
                    });
                }
            });
        });
    });
};

// Reclamar recompensa de misión completada
exports.claimMissionReward = (req, res) => {
    const { userId, missionId } = req.body;
    
    console.log(`🎁 Reclamando recompensa - Usuario: ${userId}, Misión: ${missionId}`);
    
    // Verificar que la misión esté completada
    const checkQuery = `
        SELECT ump.*, wm.target_weight, wm.reward_points, wm.name
        FROM user_mission_progress ump
        JOIN weekly_missions wm ON ump.mission_id = wm.id
        WHERE ump.user_id = ? AND ump.mission_id = ? AND ump.is_completed = 0
    `;
    
    db.get(checkQuery, [userId, missionId], (err, progress) => {
        if (err) {
            console.error('❌ Error al verificar misión:', err.message);
            return res.status(500).json({ error: 'Error al reclamar recompensa' });
        }
        
        if (!progress) {
            return res.status(400).json({ error: 'Misión no encontrada o ya reclamada' });
        }
        
        if (progress.current_weight < progress.target_weight) {
            return res.status(400).json({ 
                error: 'Misión no completada',
                current: progress.current_weight,
                target: progress.target_weight
            });
        }
        
        // Marcar misión como completada
        const updateMissionQuery = `
            UPDATE user_mission_progress 
            SET is_completed = 1, completed_at = CURRENT_TIMESTAMP 
            WHERE user_id = ? AND mission_id = ?
        `;
        
        db.run(updateMissionQuery, [userId, missionId], (err) => {
            if (err) {
                console.error('❌ Error al marcar misión completada:', err.message);
                return res.status(500).json({ error: 'Error al reclamar recompensa' });
            }
            
            // Otorgar puntos al usuario (actualizar tanto credits como total_earned)
            const updatePointsQuery = `
                UPDATE users 
                SET credits = credits + ?, total_earned = total_earned + ? 
                WHERE id = ?
            `;
            
            db.run(updatePointsQuery, [progress.reward_points, progress.reward_points, userId], (err) => {
                if (err) {
                    console.error('❌ Error al otorgar puntos:', err.message);
                    return res.status(500).json({ error: 'Error al otorgar puntos' });
                }
                
                console.log(`✅ Recompensa reclamada - ${progress.reward_points} puntos otorgados`);
                console.log(`   Credits y Total Earned actualizados`);
                
                res.json({ 
                    success: true,
                    message: `¡Misión "${progress.name}" completada!`,
                    points: progress.reward_points
                });
            });
        });
    });
};

// Crear una nueva misión (admin)
exports.createMission = (req, res) => {
    const { name, description, materialType, targetWeight, rewardPoints, startDate, endDate } = req.body;
    
    console.log('📝 Creando nueva misión:', name);
    
    const query = `
        INSERT INTO weekly_missions (name, description, material_type, target_weight, reward_points, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [name, description, materialType, targetWeight, rewardPoints, startDate, endDate], function(err) {
        if (err) {
            console.error('❌ Error al crear misión:', err.message);
            return res.status(500).json({ error: 'Error al crear misión' });
        }
        
        console.log(`✅ Misión creada con ID: ${this.lastID}`);
        res.json({ 
            success: true,
            missionId: this.lastID,
            message: 'Misión creada exitosamente'
        });
    });
};
