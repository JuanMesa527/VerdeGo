// Script para corregir el total_earned de los usuarios
// total_earned = credits actuales + SUM(recompensas ya recibidas)
// Porque cuando reciclaste, sumaste esos puntos
// Cuando contribuiste, NO se restan de total_earned (solo de credits)
// Cuando ganaste competencia, solo sumaste la recompensa nueva a total_earned

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/database.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔧 Corrigiendo total_earned de usuarios...\n');

db.serialize(() => {
    // Obtener todos los usuarios
    db.all('SELECT id, name, credits, total_earned FROM users', [], (err, users) => {
        if (err) {
            console.error('❌ Error al obtener usuarios:', err.message);
            return;
        }
        
        console.log(`📊 Encontrados ${users.length} usuarios\n`);
        
        users.forEach(user => {
            // Calcular total de recompensas recibidas de competencias
            db.get(`
                SELECT SUM(reward_points) as total_rewards
                FROM competition_rewards
                WHERE user_id = ?
            `, [user.id], (rewardErr, rewardData) => {
                if (rewardErr) {
                    console.error(`❌ Error al calcular recompensas para ${user.name}:`, rewardErr.message);
                    return;
                }
                
                const totalRewards = rewardData.total_rewards || 0;
                
                // total_earned = credits actuales (que ya incluyen puntos de reciclaje y contribuciones devueltas)
                //                + NO sumamos nada más porque:
                //                  - Cuando reciclas, se suma a credits Y a total_earned
                //                  - Cuando contribuyes, se resta de credits pero NO de total_earned
                //                  - Cuando ganas competencia, se devuelven contribuciones + recompensa a credits
                //                    y solo la recompensa a total_earned
                //
                // PERO si el total_earned está mal desde antes, lo corregimos con:
                // total_earned = credits + todas las recompensas recibidas
                // (asumiendo que credits ya incluye todo menos las recompensas)
                
                const newTotalEarned = user.credits + totalRewards;
                
                if (newTotalEarned !== user.total_earned) {
                    db.run('UPDATE users SET total_earned = ? WHERE id = ?', 
                        [newTotalEarned, user.id], 
                        (updateErr) => {
                            if (updateErr) {
                                console.error(`❌ Error al actualizar ${user.name}:`, updateErr.message);
                            } else {
                                console.log(`✅ ${user.name}:`);
                                console.log(`   - Anterior total_earned: ${user.total_earned}`);
                                console.log(`   - Nuevo total_earned: ${newTotalEarned}`);
                                console.log(`   - Credits actuales: ${user.credits}`);
                                console.log(`   - Recompensas recibidas: ${totalRewards}\n`);
                            }
                        }
                    );
                } else {
                    console.log(`✓ ${user.name} - Ya está correcto (${user.total_earned})\n`);
                }
            });
        });
        
        setTimeout(() => {
            console.log('\n✅ Proceso completado');
            db.close();
        }, 2000);
    });
});
