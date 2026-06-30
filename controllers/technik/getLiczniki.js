const pool = require('../../config/db');

const getLiczniki = async (req, res) => {
    try {
        const zapytanie = `
            SELECT 
                m.id,
                m.address AS adres,
                m.serial_number AS numer_licznika,
                r.id AS aktualny_odczyt_id,
                r.value AS aktualny_odczyt_wartosc,
                r.is_verified AS czy_zweryfikowany,
                r.photo_url AS zdjecie_url
            FROM meters m
            -- LEFT JOIN pozwala nam dołączyć TYLKO odczyt z tego miesiąca (jeśli istnieje)
            LEFT JOIN readings r ON r.meter_id = m.id 
                AND DATE_TRUNC('month', r.reading_date) = DATE_TRUNC('month', CURRENT_DATE)
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