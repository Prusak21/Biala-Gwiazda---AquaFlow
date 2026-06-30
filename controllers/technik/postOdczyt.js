const pool = require('../../config/db');

const postOdczyt = async (req, res) => {
    const { meter_id, value } = req.body;

    if (!meter_id || !value) {
        return res.status(400).json({ error: 'Brakujące dane: wybierz licznik i podaj wartość.' });
    }

    try {
        const spr = await pool.query(`
            SELECT id FROM readings 
            WHERE meter_id = $1 
            AND DATE_TRUNC('month', reading_date) = DATE_TRUNC('month', CURRENT_DATE)
        `, [meter_id]);

        if (spr.rows.length > 0) {
            return res.status(409).json({ error: 'Odczyt dla tego licznika w tym miesiącu został już wprowadzony!' });
        }

        await pool.query(
            'INSERT INTO readings (meter_id, value, reading_date, is_verified) VALUES ($1, $2, CURRENT_DATE, TRUE)',
            [meter_id, value]
        );

        res.json({ message: 'Odczyt został pomyślnie zapisany w systemie!' });
    } catch (err) {
        console.error('Błąd zapisu odczytu:', err);
        res.status(500).json({ error: 'Nie udało się zapisać odczytu w bazie.' });
    }
};

module.exports = postOdczyt;