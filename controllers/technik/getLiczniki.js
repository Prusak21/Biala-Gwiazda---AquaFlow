const pool = require('../../config/db');

const getLiczniki = async (req, res) => {
    try {
        const zapytanie = `
            SELECT 
                m.id,
                m.address AS adres,
                m.serial_number AS numer_licznika,
                (
                    SELECT value 
                    FROM readings r 
                    WHERE r.meter_id = m.id AND r.is_verified = TRUE 
                    ORDER BY reading_date DESC 
                    LIMIT 1
                ) AS ostatni_odczyt,
                EXISTS (
                    SELECT 1 
                    FROM readings r2 
                    WHERE r2.meter_id = m.id 
                    AND DATE_TRUNC('month', r2.reading_date) = DATE_TRUNC('month', CURRENT_DATE)
                ) AS czy_odczytano_w_tym_miesiacu
            FROM meters m
            WHERE m.is_main_meter = FALSE
            ORDER BY m.address ASC;
        `;

        const result = await pool.query(zapytanie);
        res.json(result.rows);
    } catch (err) {
        console.error('Błąd podczas pobierania listy liczników:', err);
        res.status(500).json({ error: 'Nie udało się pobrać listy adresów.' });
    }
};

module.exports = getLiczniki;