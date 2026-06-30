// Plik: config/db.js
const { Pool } = require('pg');
require('dotenv').config(); // Dla pewności, że zmienne środowiskowe są tu dostępne

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect()
    .then(() => console.log('✅ Połączono z bazą PostgreSQL (AquaFlow)!'))
    .catch(err => console.error('❌ Błąd połączenia z bazą:', err));

// Eksportujemy obiekt pool, aby inne pliki mogły wysyłać zapytania SQL
module.exports = pool;