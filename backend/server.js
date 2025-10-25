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

// Importar middleware
const { verificarToken } = require('./middleware/auth');

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

// Rutas de rangos
app.get('/api/ranks', rankController.getAllRanks);
app.post('/api/rank', rankController.createRank);

// Rutas de transacciones
app.post('/api/transaccion', transactionController.createTransaction);
app.get('/api/transacciones', transactionController.getAllTransactions);

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

// ============================================
// MANEJO DE ERRORES 404
// ============================================

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ===================================');
    console.log(`🌿 Servidor VerdeGo iniciado en puerto ${PORT}`);
    console.log(`📡 API disponible en: http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
    console.log('🚀 ===================================');
    console.log('');
});
