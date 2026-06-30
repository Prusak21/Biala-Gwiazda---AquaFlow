const pool = require('../../config/db');

const getMapaPunkty = async (req, res) => {
    try {
        const zapytanie = `
            SELECT 
                m.id,
                m.address AS adres,
                m.serial_number AS numer_licznika,
                ST_AsGeoJSON(m.geom) AS lokalizacja,
                EXISTS (
                    SELECT 1 FROM readings r 
                    WHERE r.meter_id = m.id 
                    AND DATE_TRUNC('month', r.reading_date) = DATE_TRUNC('month', CURRENT_DATE)
                ) AS czy_odczytano
            FROM meters m
            WHERE m.is_main_meter = FALSE
            AND m.geom IS NOT NULL;
        `;

        const result = await pool.query(zapytanie);
        res.json(result.rows);
    } catch (err) {
        console.error('Błąd pobierania punktów na mapę:', err);
        res.status(500).json({ error: 'Nie udało się załadować danych mapy.' });
    }
};

module.exports = getMapaPunkty;