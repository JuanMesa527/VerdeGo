// Test de fechas
const now = new Date('2025-11-07'); // Viernes 7
console.log('Hoy:', now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
console.log('Día de la semana (getDay):', now.getDay()); // 5 = viernes

const dayOfWeek = now.getDay();

let monday = new Date(now);
if (dayOfWeek === 0) {
    monday.setDate(now.getDate() - 6);
} else {
    monday.setDate(now.getDate() - (dayOfWeek - 1));
}
monday.setHours(0, 0, 0, 0);

console.log('\nLunes calculado:', monday.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
console.log('Día de la semana:', monday.getDay()); // Debería ser 1 = lunes

const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);
sunday.setHours(23, 59, 59, 999);

console.log('\nDomingo calculado:', sunday.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
console.log('Día de la semana:', sunday.getDay()); // Debería ser 0 = domingo
console.log('Fecha ISO:', sunday.toISOString().split('T')[0]);
