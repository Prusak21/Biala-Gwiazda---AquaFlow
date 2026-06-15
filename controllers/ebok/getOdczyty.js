const pool = require('../../config/db');

const getOdczyty = async (req, res) => {
    try {
        const zapytanie = `
            SELECT r.id, r.reading_date, r.value, r.is_verified, m.serial_number
            FROM readings r
            JOIN meters m ON r.meter_id = m.id
            WHERE m.user_id = $1
            ORDER BY r.reading_date DESC;
        `;
        const result = await pool.query(zapytanie, [req.user.id]);
        const numerLicznika = result.rows.length > 0 ? result.rows[0].serial_number : 'Brak przypisanego licznika';

        res.json({ odczyty: result.rows, numerLicznika });
    } catch (err) {
        console.error('Błąd pobierania odczytów:', err);
        res.status(500).json({ error: 'Nie udało się pobrać historii odczytów.' });
    }
};

module.exports = getOdczyty;