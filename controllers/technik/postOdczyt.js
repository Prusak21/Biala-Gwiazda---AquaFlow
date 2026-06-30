const pool = require('../../config/db');

const postOdczyt = async (req, res) => {
    // Dodaliśmy reading_id – jeśli zostanie przesłane, wiemy, że inkasent klika "Weryfikuj"
    const { meter_id, value, reading_id } = req.body;

    if (!meter_id || !value) {
        return res.status(400).json({ error: 'Brakujące dane: wybierz licznik i podaj wartość.' });
    }

    try {
        // SCENARIUSZ 1: Weryfikacja istniejącego odczytu od mieszkańca
        if (reading_id) {
            await pool.query(
                'UPDATE readings SET is_verified = TRUE, value = $1 WHERE id = $2',
                [value, reading_id] // value może być poprawione przez inkasenta, jeśli na zdjęciu było coś innego
            );
            return res.json({ message: 'Odczyt mieszkańca został zweryfikowany i zatwierdzony!' });
        }

        // SCENARIUSZ 2: Nowy odczyt wklepany ręcznie przez inkasenta (bo mieszkaniec nie podał)
        const spr = await pool.query(`
            SELECT id FROM readings 
            WHERE meter_id = $1 
            AND DATE_TRUNC('month', reading_date) = DATE_TRUNC('month', CURRENT_DATE)
        `, [meter_id]);

        if (spr.rows.length > 0) {
            return res.status(409).json({ error: 'Odczyt dla tego licznika w tym miesiącu został już wprowadzony!' });
        }

        // Odczyt inkasenta od razu wchodzi do bazy jako pewny (is_verified = TRUE)
        await pool.query(
            'INSERT INTO readings (meter_id, value, reading_date, is_verified) VALUES ($1, $2, CURRENT_DATE, TRUE)',
            [meter_id, value]
        );

        res.json({ message: 'Odczyt został pomyślnie zapisany i od razu zatwierdzony!' });
    } catch (err) {
        console.error('Błąd zapisu odczytu:', err);
        res.status(500).json({ error: 'Nie udało się zapisać odczytu w bazie.' });
    }
};

module.exports = postOdczyt;