// Plik: controllers/technik/getDashboard.js
const pool = require('../../config/db'); // Zwróć uwagę na ścieżkę: wychodzimy dwa poziomy wyżej!

const getDashboard = async (req, res) => {
    try {
        const zrobioneQuery = await pool.query(`
            SELECT COUNT(DISTINCT meter_id) AS zrobione 
            FROM readings 
            WHERE DATE_TRUNC('month', reading_date) = DATE_TRUNC('month', CURRENT_DATE)
        `);
        const zrobione = parseInt(zrobioneQuery.rows[0].zrobione);

        const wszystkieQuery = await pool.query(`SELECT COUNT(*) AS wszystkie FROM meters`);
        const wszystkie = parseInt(wszystkieQuery.rows[0].wszystkie);
        const pozostalo = wszystkie - zrobione;

        const awarieQuery = await pool.query(`
            SELECT 
                i.id, COALESCE(u.email, 'Brak danych') AS zglaszajacy, 
                i.current_status, i.created_at,
                (SELECT description FROM incident_updates iu WHERE iu.incident_id = i.id ORDER BY created_at DESC LIMIT 1) AS najnowszy_komunikat
            FROM incidents i
            LEFT JOIN users u ON i.reported_by = u.id
            WHERE i.current_status != 'resolved'
            ORDER BY i.created_at DESC
        `);

        res.json({
            statystyki: { zrobione, pozostalo, awarie_liczba: awarieQuery.rows.length },
            awarie: awarieQuery.rows
        });

    } catch (err) {
        console.error('Błąd pobierania dashboardu:', err);
        res.status(500).json({ error: 'Nie udało się załadować danych.' });
    }
};

// Eksportujemy samą funkcję
module.exports = getDashboard;