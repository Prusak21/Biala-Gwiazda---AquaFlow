const pool = require('../../config/db');

const postOdczyt = async (req, res) => {
    const { stan } = req.body;
    const mieszkaniec_id = req.user.id;

    if (!stan) return res.status(400).json({ error: 'Proszę podać stan licznika.' });

    try {
        const licznikCheck = await pool.query(`SELECT id FROM meters WHERE user_id = $1 LIMIT 1`, [mieszkaniec_id]);
        
        if (licznikCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Do Twojego konta nie jest przypisany żaden licznik.' });
        }

        const meter_id = licznikCheck.rows[0].id;

        const spr = await pool.query(`
            SELECT id FROM readings WHERE meter_id = $1 
            AND DATE_TRUNC('month', reading_date) = DATE_TRUNC('month', CURRENT_DATE)
        `, [meter_id]);

        if (spr.rows.length > 0) {
            return res.status(409).json({ error: 'Odczyt dla tego licznika w obecnym miesiącu został już zapisany!' });
        }

        await pool.query(
            'INSERT INTO readings (meter_id, value, reading_date, is_verified) VALUES ($1, $2, CURRENT_DATE, FALSE)',
            [meter_id, stan]
        );

        res.json({ message: 'Twój odczyt został pomyślnie wysłany i oczekuje na weryfikację przez Urząd.' });
    } catch (err) {
        console.error('Błąd zapisu odczytu z eBOK:', err);
        res.status(500).json({ error: 'Wystąpił błąd serwera. Spróbuj ponownie.' });
    }
};

module.exports = postOdczyt;