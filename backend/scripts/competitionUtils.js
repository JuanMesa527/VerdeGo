// ============================================
// SCRIPT DE UTILIDADES PARA COMPETENCIAS
// ============================================
// Este script proporciona funciones útiles para administrar competencias

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/database.db');
const db = new sqlite3.Database(DB_PATH);

// Crear una nueva competencia
function createCompetition() {
    const name = "Competencia Universitaria 2024";
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 días de duración
    
    const sql = `
        INSERT INTO competitions (name, start_date, end_date, reward_percentage, status)
        VALUES (?, ?, ?, ?, 'active')
    `;
    
    db.run(sql, [name, startDate.toISOString(), endDate.toISOString(), 10], function(err) {
        if (err) {
            console.error('❌ Error al crear competencia:', err.message);
        } else {
            console.log('✅ Competencia creada exitosamente!');
            console.log('   - ID:', this.lastID);
            console.log('   - Nombre:', name);
            console.log('   - Inicio:', startDate.toISOString());
            console.log('   - Fin:', endDate.toISOString());
            console.log('   - Recompensa: 10% + bonus');
        }
        db.close();
    });
}

// Finalizar competencia y distribuir recompensas
function finalizeCompetition(competitionId) {
    console.log(`🏁 Finalizando competencia ${competitionId}...`);
    
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
            console.error('❌ Error:', err.message);
            db.close();
            return;
        }
        
        if (topUniversities.length === 0) {
            console.log('⚠️  No hay participantes en esta competencia');
            db.close();
            return;
        }
        
        console.log('\n🏆 Top 3 Universidades:');
        topUniversities.forEach((uni, idx) => {
            console.log(`   ${idx + 1}. ${uni.university_name}: ${uni.total_points} puntos`);
        });
        
        // Obtener contribuciones
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
                console.error('❌ Error:', err.message);
                db.close();
                return;
            }
            
            console.log(`\n💰 Distribuyendo recompensas a ${contributors.length} usuarios...\n`);
            
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                
                let processed = 0;
                contributors.forEach((contributor) => {
                    const universityRank = topUniversities.findIndex(u => u.university_id === contributor.university_id) + 1;
                    const bonusMultiplier = universityRank === 1 ? 1.5 : universityRank === 2 ? 1.25 : 1.1;
                    const rewardPoints = Math.floor(contributor.total_contributed * 0.1 * bonusMultiplier);
                    
                    // Devolver puntos
                    db.run('UPDATE users SET credits = credits + ? WHERE id = ?', 
                        [rewardPoints, contributor.user_id]);
                    
                    // Registrar recompensa
                    db.run(`
                        INSERT INTO competition_rewards 
                        (user_id, competition_id, university_id, points_contributed, reward_points, university_rank)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [contributor.user_id, competitionId, contributor.university_id, 
                        contributor.total_contributed, rewardPoints, universityRank], () => {
                        processed++;
                        console.log(`   ✓ Usuario ${contributor.user_id}: +${rewardPoints} puntos (Rank #${universityRank})`);
                        
                        if (processed === contributors.length) {
                            // Marcar como finalizada
                            db.run('UPDATE competitions SET status = ? WHERE id = ?', 
                                ['finished', competitionId], () => {
                                db.run('COMMIT');
                                console.log('\n✅ Competencia finalizada exitosamente!');
                                db.close();
                            });
                        }
                    });
                });
            });
        });
    });
}

// Ver estado de competencias
function listCompetitions() {
    const sql = 'SELECT * FROM competitions ORDER BY created_at DESC';
    
    db.all(sql, [], (err, competitions) => {
        if (err) {
            console.error('❌ Error:', err.message);
        } else {
            console.log('\n📋 COMPETENCIAS:\n');
            competitions.forEach(comp => {
                console.log(`ID: ${comp.id}`);
                console.log(`Nombre: ${comp.name}`);
                console.log(`Estado: ${comp.status}`);
                console.log(`Inicio: ${comp.start_date}`);
                console.log(`Fin: ${comp.end_date}`);
                console.log('---');
            });
        }
        db.close();
    });
}

// Ver ranking de una competencia
function showRanking(competitionId) {
    const sql = `
        SELECT 
            u.name,
            u.logo,
            COALESCE(SUM(uc.points_contributed), 0) as total_points,
            COUNT(DISTINCT uc.user_id) as contributors
        FROM universities u
        LEFT JOIN university_contributions uc ON u.id = uc.university_id AND uc.competition_id = ?
        GROUP BY u.id
        ORDER BY total_points DESC
    `;
    
    db.all(sql, [competitionId], (err, ranking) => {
        if (err) {
            console.error('❌ Error:', err.message);
        } else {
            console.log(`\n🏆 RANKING - Competencia ${competitionId}:\n`);
            ranking.forEach((uni, idx) => {
                console.log(`${idx + 1}. ${uni.logo} ${uni.name}`);
                console.log(`   Puntos: ${uni.total_points} | Contribuyentes: ${uni.contributors}`);
            });
        }
        db.close();
    });
}

// Ejecutar función según argumento
const command = process.argv[2];
const arg = process.argv[3];

switch(command) {
    case 'create':
        createCompetition();
        break;
    case 'finalize':
        if (!arg) {
            console.error('❌ Especifica el ID de la competencia');
            process.exit(1);
        }
        finalizeCompetition(parseInt(arg));
        break;
    case 'list':
        listCompetitions();
        break;
    case 'ranking':
        if (!arg) {
            console.error('❌ Especifica el ID de la competencia');
            process.exit(1);
        }
        showRanking(parseInt(arg));
        break;
    default:
        console.log(`
Uso: node competitionUtils.js <comando> [argumentos]

Comandos disponibles:
  create              - Crear una nueva competencia
  finalize <id>       - Finalizar competencia y distribuir recompensas
  list                - Listar todas las competencias
  ranking <id>        - Ver ranking de una competencia

Ejemplos:
  node competitionUtils.js create
  node competitionUtils.js finalize 1
  node competitionUtils.js list
  node competitionUtils.js ranking 1
        `);
        process.exit(0);
}
