const db = require('../backend/config/database');

db.all('SELECT id, email, referral_code, credits, total_earned FROM users', [], (err, rows) => {
    if (err) {
        console.error('Error al leer usuarios:', err.message);
        process.exit(1);
    }
    console.log('Usuarios en DB:');
    rows.forEach(r => {
        console.log(JSON.stringify(r));
    });
    process.exit(0);
});
