// ============================================
// CONTROLADOR DE COMPETENCIAS DE UNIVERSIDADES
// ============================================

const db = require('../config/database');

// Obtener la competencia activa actual
function getActiveCompetition(req, res) {
    const sql = `
        SELECT * FROM competitions 
        WHERE status = 'active' 
        AND datetime('now') BETWEEN datetime(start_date) AND datetime(end_date)
        ORDER BY created_at DESC 
        LIMIT 1
    `;
    
    console.log('🔍 Buscando competencia activa...');
    
    db.get(sql, [], (err, competition) => {
        if (err) {
            console.error('❌ Error al obtener competencia activa:', err.message);
            return res.status(500).json({ error: 'Error al obtener competencia' });
        }
        
        console.log('📊 Competencia encontrada:', competition);
        
        res.json({
            competition: competition || null,
            hasActive: !!competition
        });
    });
}

// Obtener ranking de universidades
function getUniversityRanking(req, res) {
    const competitionId = req.query.competitionId;
    
    let sql;
    let params = [];
    
    if (competitionId) {
        // Ranking para una competencia específica
        sql = `
            SELECT 
                u.id,
                u.name,
                u.logo,
                u.color,
                COALESCE(SUM(uc.points_contributed), 0) as total_points,
                COUNT(DISTINCT uc.user_id) as total_contributors
            FROM universities u
            LEFT JOIN university_contributions uc ON u.id = uc.university_id AND uc.competition_id = ?
            GROUP BY u.id
            ORDER BY total_points DESC
        `;
        params = [competitionId];
    } else {
        // Ranking global de todas las competencias
        sql = `
            SELECT 
                u.id,
                u.name,
                u.logo,
                u.color,
                u.total_points,
                COUNT(DISTINCT uc.user_id) as total_contributors
            FROM universities u
            LEFT JOIN university_contributions uc ON u.id = uc.university_id
            GROUP BY u.id
            ORDER BY u.total_points DESC
        `;
    }
    
    db.all(sql, params, (err, universities) => {
        if (err) {
            console.error('❌ Error al obtener ranking:', err.message);
            return res.status(500).json({ error: 'Error al obtener ranking' });
        }
        
        // Agregar posición en el ranking
        const ranking = universities.map((uni, index) => ({
            ...uni,
            rank: index + 1
        }));
        
        res.json({
            ranking: ranking,
            total: universities.length
        });
    });
}

// Contribuir puntos a una universidad
function contributePoints(req, res) {
    const { userId, universityId, points, competitionId } = req.body;
    
    console.log('🎓 Solicitud de contribución:');
    console.log('   - Usuario:', userId);
    console.log('   - Universidad:', universityId);
    console.log('   - Puntos:', points);
    console.log('   - Competencia:', competitionId);
    
    if (!userId || !universityId || !points || !competitionId) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }
    
    if (points <= 0) {
        return res.status(400).json({ error: 'Los puntos deben ser positivos' });
    }
    
    // Verificar que el usuario tenga suficientes puntos
    db.get('SELECT credits FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('❌ Error al verificar usuario:', err.message);
            return res.status(500).json({ error: 'Error al verificar usuario' });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        if (user.credits < points) {
            return res.status(400).json({ 
                error: 'Puntos insuficientes',
                available: user.credits,
                required: points
            });
        }
        
        // Verificar que la competencia esté activa
        db.get('SELECT * FROM competitions WHERE id = ? AND status = "active"', [competitionId], (err, competition) => {
            if (err) {
                console.error('❌ Error al verificar competencia:', err.message);
                return res.status(500).json({ error: 'Error al verificar competencia' });
            }
            
            if (!competition) {
                return res.status(400).json({ error: 'Competencia no activa' });
            }
            
            // Verificar que la competencia no haya terminado
            const now = new Date();
            const endDate = new Date(competition.end_date);
            
            if (now > endDate) {
                return res.status(400).json({ error: 'La competencia ha finalizado' });
            }
            
            // Iniciar transacción
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                
                // Descontar puntos del usuario
                db.run('UPDATE users SET credits = credits - ? WHERE id = ?', [points, userId], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        console.error('❌ Error al descontar puntos:', err.message);
                        return res.status(500).json({ error: 'Error al procesar transacción' });
                    }
                    
                    // Agregar puntos a la universidad (global)
                    db.run('UPDATE universities SET total_points = total_points + ? WHERE id = ?', [points, universityId], function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            console.error('❌ Error al sumar puntos a universidad:', err.message);
                            return res.status(500).json({ error: 'Error al procesar transacción' });
                        }
                        
                        // Registrar la contribución
                        db.run(`
                            INSERT INTO university_contributions 
                            (user_id, university_id, competition_id, points_contributed) 
                            VALUES (?, ?, ?, ?)
                        `, [userId, universityId, competitionId, points], function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                console.error('❌ Error al registrar contribución:', err.message);
                                return res.status(500).json({ error: 'Error al procesar transacción' });
                            }
                            
                            db.run('COMMIT');
                            
                            console.log('✅ Contribución exitosa!');
                            console.log('   - ID de contribución:', this.lastID);
                            
                            res.json({
                                mensaje: 'Contribución exitosa',
                                contributionId: this.lastID,
                                pointsContributed: points,
                                newBalance: user.credits - points
                            });
                        });
                    });
                });
            });
        });
    });
}

// Obtener contribuciones de un usuario
function getUserContributions(req, res) {
    const userId = req.params.userId;
    const competitionId = req.query.competitionId;
    
    let sql;
    let params;
    
    if (competitionId) {
        sql = `
            SELECT 
                uc.*,
                u.name as university_name,
                u.logo as university_logo,
                u.color as university_color,
                c.name as competition_name
            FROM university_contributions uc
            JOIN universities u ON uc.university_id = u.id
            JOIN competitions c ON uc.competition_id = c.id
            WHERE uc.user_id = ? AND uc.competition_id = ?
            ORDER BY uc.contributed_at DESC
        `;
        params = [userId, competitionId];
    } else {
        sql = `
            SELECT 
                uc.*,
                u.name as university_name,
                u.logo as university_logo,
                u.color as university_color,
                c.name as competition_name
            FROM university_contributions uc
            JOIN universities u ON uc.university_id = u.id
            JOIN competitions c ON uc.competition_id = c.id
            WHERE uc.user_id = ?
            ORDER BY uc.contributed_at DESC
        `;
        params = [userId];
    }
    
    db.all(sql, params, (err, contributions) => {
        if (err) {
            console.error('❌ Error al obtener contribuciones:', err.message);
            return res.status(500).json({ error: 'Error al obtener contribuciones' });
        }
        
        const totalContributed = contributions.reduce((sum, c) => sum + c.points_contributed, 0);
        
        res.json({
            contributions: contributions,
            totalContributed: totalContributed,
            count: contributions.length
        });
    });
}

// Crear una nueva competencia
function createCompetition(req, res) {
    const { name, startDate, endDate, rewardPercentage } = req.body;
    
    console.log('🏆 Creando nueva competencia:');
    console.log('   - Nombre:', name);
    console.log('   - Inicio:', startDate);
    console.log('   - Fin:', endDate);
    
    if (!name || !startDate || !endDate) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }
    
    const sql = `
        INSERT INTO competitions (name, start_date, end_date, reward_percentage, status) 
        VALUES (?, ?, ?, ?, 'active')
    `;
    
    db.run(sql, [name, startDate, endDate, rewardPercentage || 10], function(err) {
        if (err) {
            console.error('❌ Error al crear competencia:', err.message);
            return res.status(500).json({ error: 'Error al crear competencia' });
        }
        
        console.log('✅ Competencia creada exitosamente!');
        console.log('   - ID:', this.lastID);
        
        res.json({
            mensaje: 'Competencia creada exitosamente',
            competitionId: this.lastID
        });
    });
}

// Finalizar competencia y distribuir recompensas
function finalizeCompetition(req, res) {
    const competitionId = req.params.competitionId;
    
    console.log('🏁 Finalizando competencia:', competitionId);
    
    // Obtener información de la competencia
    db.get('SELECT * FROM competitions WHERE id = ?', [competitionId], (err, competition) => {
        if (err || !competition) {
            console.error('❌ Error al obtener competencia:', err?.message);
            return res.status(404).json({ error: 'Competencia no encontrada' });
        }
        
        // Obtener top 3 universidades
        const sqlRanking = `
            SELECT 
                u.id as university_id,
                u.name as university_name,
                COALESCE(SUM(uc.points_contributed), 0) as total_points
            FROM universities u
            LEFT JOIN university_contributions uc ON u.id = uc.university_id AND uc.competition_id = ?
            GROUP BY u.id
            ORDER BY total_points DESC
            LIMIT 3
        `;
        
        db.all(sqlRanking, [competitionId], (err, topUniversities) => {
            if (err) {
                console.error('❌ Error al obtener ranking:', err.message);
                return res.status(500).json({ error: 'Error al procesar ranking' });
            }
            
            if (topUniversities.length === 0) {
                return res.status(400).json({ error: 'No hay participantes en esta competencia' });
            }
            
            console.log('🏆 Top 3 Universidades:');
            topUniversities.forEach((uni, idx) => {
                console.log(`   ${idx + 1}. ${uni.university_name}: ${uni.total_points} puntos`);
            });
            
            // Obtener contribuciones de usuarios para las universidades ganadoras
            const winnerIds = topUniversities.map(u => u.university_id);
            const placeholders = winnerIds.map(() => '?').join(',');
            
            const sqlContributors = `
                SELECT 
                    user_id,
                    university_id,
                    SUM(points_contributed) as total_contributed
                FROM university_contributions
                WHERE competition_id = ? AND university_id IN (${placeholders})
                GROUP BY user_id, university_id
            `;
            
            db.all(sqlContributors, [competitionId, ...winnerIds], (err, contributors) => {
                if (err) {
                    console.error('❌ Error al obtener contribuyentes:', err.message);
                    return res.status(500).json({ error: 'Error al procesar contribuyentes' });
                }
                
                console.log(`💰 Distribuyendo recompensas a ${contributors.length} usuarios...`);
                
                const rewardPercentage = competition.reward_percentage || 10;
                let rewardsDistributed = 0;
                
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');
                    
                    contributors.forEach((contributor, index) => {
                        const universityRank = topUniversities.findIndex(u => u.university_id === contributor.university_id) + 1;
                        const bonusMultiplier = universityRank === 1 ? 1.5 : universityRank === 2 ? 1.25 : 1.1;
                        const rewardPoints = Math.floor(contributor.total_contributed * (rewardPercentage / 100) * bonusMultiplier);
                        
                        // Devolver puntos contribuidos + recompensa al usuario
                        const totalToReturn = contributor.total_contributed + rewardPoints;
                        db.run('UPDATE users SET credits = credits + ? WHERE id = ?', 
                            [totalToReturn, contributor.user_id], 
                            function(updateErr) {
                                if (updateErr) {
                                    console.error(`❌ Error al dar recompensa a usuario ${contributor.user_id}:`, updateErr.message);
                                } else {
                                    console.log(`   ✅ Usuario ${contributor.user_id}: +${contributor.total_contributed} (contribución) +${rewardPoints} (recompensa) = ${totalToReturn} pts`);
                                }
                            }
                        );
                        
                        // Registrar recompensa
                        db.run(`
                            INSERT INTO competition_rewards 
                            (user_id, competition_id, university_id, points_contributed, reward_points, university_rank)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `, [contributor.user_id, competitionId, contributor.university_id, contributor.total_contributed, rewardPoints, universityRank],
                            function(rewardErr) {
                                if (rewardErr) {
                                    console.error(`❌ Error al registrar recompensa:`, rewardErr.message);
                                } else {
                                    rewardsDistributed++;
                                }
                            }
                        );
                    });
                    
                    // Marcar competencia como finalizada
                    db.run('UPDATE competitions SET status = ? WHERE id = ?', ['finished', competitionId], function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            console.error('❌ Error al finalizar competencia:', err.message);
                            return res.status(500).json({ error: 'Error al finalizar competencia' });
                        }
                        
                        db.run('COMMIT');
                        
                        console.log('✅ Competencia finalizada exitosamente!');
                        console.log(`   - Recompensas distribuidas: ${contributors.length}`);
                        
                        res.json({
                            mensaje: 'Competencia finalizada y recompensas distribuidas',
                            topUniversities: topUniversities,
                            rewardsDistributed: contributors.length,
                            rewardPercentage: rewardPercentage
                        });
                    });
                });
            });
        });
    });
}

// Obtener todas las universidades
function getAllUniversities(req, res) {
    const sql = 'SELECT * FROM universities ORDER BY name ASC';
    
    db.all(sql, [], (err, universities) => {
        if (err) {
            console.error('❌ Error al obtener universidades:', err.message);
            return res.status(500).json({ error: 'Error al obtener universidades' });
        }
        
        res.json({
            universities: universities,
            total: universities.length
        });
    });
}

/**
 * Obtener recompensas del usuario
 */
function getUserRewards(req, res) {
    const userId = req.params.userId;
    
    console.log(`\n📊 Obteniendo recompensas para usuario ${userId}...`);
    
    const sql = `
        SELECT 
            cr.*,
            c.name as competition_name,
            c.start_date,
            c.end_date,
            u.name as university_name,
            u.logo as university_logo
        FROM competition_rewards cr
        JOIN competitions c ON cr.competition_id = c.id
        JOIN universities u ON cr.university_id = u.id
        WHERE cr.user_id = ?
        ORDER BY cr.created_at DESC
    `;
    
    db.all(sql, [userId], (err, rewards) => {
        if (err) {
            console.error('❌ Error al obtener recompensas:', err.message);
            return res.status(500).json({ error: 'Error al obtener recompensas' });
        }
        
        console.log(`✅ Recompensas encontradas: ${rewards.length}`);
        
        res.json({
            rewards: rewards,
            total: rewards.length
        });
    });
}

/**
 * Obtener historial de todas las competencias
 */
function getAllCompetitions(req, res) {
    console.log('📜 Obteniendo historial de competencias...');
    
    const sql = `
        SELECT 
            c.*,
            COUNT(DISTINCT uc.user_id) as total_participants,
            COALESCE(SUM(uc.points_contributed), 0) as total_points_contributed
        FROM competitions c
        LEFT JOIN university_contributions uc ON c.id = uc.competition_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
    `;
    
    db.all(sql, [], (err, competitions) => {
        if (err) {
            console.error('❌ Error al obtener competencias:', err.message);
            return res.status(500).json({ error: 'Error al obtener competencias' });
        }
        
        console.log(`✅ Competencias encontradas: ${competitions.length}`);
        
        res.json({
            competitions: competitions,
            total: competitions.length
        });
    });
}

module.exports = {
    getActiveCompetition,
    getUniversityRanking,
    contributePoints,
    getUserContributions,
    getUserRewards,
    createCompetition,
    finalizeCompetition,
    getAllUniversities,
    getAllCompetitions
};
