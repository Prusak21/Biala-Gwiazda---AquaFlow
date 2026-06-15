const pool = require('../../config/db');

const getAwarie = async (req, res) => {
    try {
        const zapytanie = `
            SELECT 
                i.id,
                i.current_status,
                i.created_at,
                u.email AS zglaszajacy,
                ST_AsGeoJSON(i.geom) AS lokalizacja,
                (
                    SELECT description 
                    FROM incident_updates iu 
                    WHERE iu.incident_id = i.id 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) as najnowszy_komunikat
            FROM incidents i
            JOIN users u ON i.reported_by = u.id
            ORDER BY i.created_at DESC;
        `;

        const result = await pool.query(zapytanie);
        res.json(result.rows);
    } catch (err) {
        console.error('Błąd podczas pobierania awarii:', err);
        res.status(500).json({ error: 'Nie udało się pobrać danych o awariach.' });
    }
};

module.exports = getAwarie;