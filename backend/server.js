// ============================================
// SERVIDOR EXPRESS - VerdeGo Backend
// ============================================

// Cargar variables de entorno PRIMERO
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar configuración
require('./config/database'); // Inicializar la base de datos

// Importar controladores
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const transactionController = require('./controllers/transactionController');
const locationController = require('./controllers/locationController');
const rankController = require('./controllers/rankController');
const pointsController = require('./controllers/pointsController');
const bonusController = require('./controllers/bonusController');
const rechargeController = require('./controllers/rechargeController');
const statsController = require('./controllers/statsController');
const competitionController = require('./controllers/competitionController');
const missionController = require('./controllers/missionController');

// Importar middleware
const { verificarToken } = require('./middleware/auth');
const { autoUpdateMissions } = require('./middleware/weeklyMissionsUpdate');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================

// CORS - Permitir peticiones desde el frontend
app.use(cors());

// Parsear JSON en el body de las peticiones
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Log de todas las peticiones
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});

// ============================================
// RUTAS DEL API
// ============================================

// Rutas de autenticación
app.post('/api/crear-usuario', authController.register);
app.post('/api/login', authController.login);
app.get('/api/verificar-token', verificarToken, authController.verifyToken);
app.get('/api/perfil', verificarToken, authController.getProfile);

// Rutas de usuarios
app.get('/api/usuarios', userController.getAllUsers);
app.get('/api/usuario/:email', userController.getUserByEmail);
app.delete('/api/usuario/:id', userController.deleteUser);

// Rutas de ubicaciones
app.get('/api/ubicaciones', locationController.getAllLocations);
app.post('/api/ubicacion', locationController.createLocation);
app.get('/api/locations', locationController.getAllLocations);
app.get('/api/locations/:id', locationController.getLocationById);
app.post('/api/locations', locationController.createLocation);
app.put('/api/locations/:id', locationController.updateLocation);
app.delete('/api/locations/:id', locationController.deleteLocation);

// Rutas de rangos
app.get('/api/ranks', rankController.getAllRanks);
app.post('/api/rank', rankController.createRank);

// Rutas de transacciones
app.post('/api/transaccion', transactionController.createTransaction);
app.get('/api/transacciones', transactionController.getAllTransactions);

// Rutas de puntos (simulación)
app.post('/api/actualizar-puntos', verificarToken, pointsController.updateUserPoints);
app.get('/api/puntos/:userId', pointsController.getUserPoints);

// Rutas de bonos
app.post('/api/canjear-bono', verificarToken, bonusController.redeemBonus);
app.get('/api/bonos-canjeados/:userId', bonusController.getUserRedeemedBonuses);
app.get('/api/estadisticas-bonos/:userId', bonusController.getUserBonusStats);

// Rutas de recargas TuLlave
app.post('/api/crear-recarga', verificarToken, rechargeController.createRecharge);
app.get('/api/recargas/:userId', rechargeController.getUserRecharges);
app.get('/api/estadisticas-recargas/:userId', rechargeController.getRechargeStats);
app.post('/api/verificar-puntos', rechargeController.checkPointsAvailability);

// Rutas de estadísticas generales
app.get('/api/stats', statsController.getStats);

// Rutas de competencias
app.get('/api/competencia-activa', competitionController.getActiveCompetition);
app.get('/api/ranking-universidades', competitionController.getUniversityRanking);
app.get('/api/universidades', competitionController.getAllUniversities);
app.post('/api/contribuir-universidad', verificarToken, competitionController.contributePoints);
app.get('/api/contribuciones/:userId', competitionController.getUserContributions);
app.get('/api/recompensas/:userId', competitionController.getUserRewards);
app.post('/api/crear-competencia', competitionController.createCompetition);
app.post('/api/finalizar-competencia/:competitionId', competitionController.finalizeCompetition);
app.get('/api/competencias', competitionController.getAllCompetitions);

// Rutas de misiones semanales (con auto-actualización)
app.get('/api/misiones-activas', autoUpdateMissions, missionController.getActiveMissions);
app.get('/api/misiones-progreso/:userId', autoUpdateMissions, missionController.getUserMissionProgress);
app.post('/api/actualizar-mision', autoUpdateMissions, missionController.updateMissionProgress);
app.post('/api/reclamar-mision', verificarToken, autoUpdateMissions, missionController.claimMissionReward);
app.post('/api/crear-mision', missionController.createMission);

// ============================================
// RUTA PARA SERVIR EL FRONTEND
// ============================================

// Servir index.html en la ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Servir páginas específicas
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
});

app.get('/simulacion', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/simulacion/index.html'));
});

app.get('/simulacion/test', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/simulacion/test-ruta.html'));
});

app.get('/pages/user/bonuses', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/user/bonuses.html'));
});

app.get('/pages/user/account', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/user/account.html'));
});

app.get('/pages/user/recharges', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/user/recharges.html'));
});

app.get('/pages/user/competitions', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/user/competitions.html'));
});

app.get('/pages/user/missions', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/user/missions.html'));
});

app.get('/pages/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/contact.html'));
});

app.get('/pages/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/about.html'));
});

app.get('/pages/admin-competencias', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/admin-competencias.html'));
});

app.get('/addlocation', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/addlocation.html'));
});

// ============================================
// MANEJO DE ERRORES 404
// ============================================

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, async () => {
    console.log('');
    console.log('🚀 ===================================');
    console.log(`🌿 Servidor VerdeGo iniciado en puerto ${PORT}`);
    console.log(`📡 API disponible en: http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
    console.log('🚀 ===================================');
    console.log('');
    
    // Esperar a que las tablas se creen antes de inicializar datos
    setTimeout(async () => {
        console.log('');
        console.log('🔄 ===================================');
        console.log('📦 Iniciando configuración de datos...');
        console.log('🔄 ===================================');
        
        // Inicializar ubicaciones predefinidas (solo si la tabla está vacía)
        try {
            const { initializeLocations } = require('./scripts/initLocations');
            await initializeLocations();
        } catch (err) {
            console.error('❌ Error al inicializar ubicaciones:', err);
            console.error('Detalle:', err.stack);
        }
        
        // Verificar y actualizar misiones semanales
        try {
            const { checkAndUpdateMissions } = require('./middleware/weeklyMissionsUpdate');
            console.log('🔍 Verificando misiones semanales...');
            await checkAndUpdateMissions();
            console.log('✅ Verificación de misiones completada');
        } catch (err) {
            console.error('❌ Error al verificar misiones:', err);
        }
        
        console.log('');
        console.log('✅ ===================================');
        console.log('🎉 Servidor completamente inicializado');
        console.log('✅ ===================================');
        console.log('');
    }, 2000); // Esperar 2 segundos para asegurar que las tablas estén creadas
});
