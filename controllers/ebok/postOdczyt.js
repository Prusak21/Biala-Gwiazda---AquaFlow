const pool = require('../../config/db');

const postOdczyt = async (req, res) => {
    // Oczekujemy również na pole ze zdjęciem (np. URL z serwera po wgraniu pliku lub base64)
    const { stan, zdjecie_url } = req.body; 
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

        // Zapisujemy z is_verified = FALSE oraz dodajemy link do zdjęcia (jeśli frontend go wyśle)
        await pool.query(
            'INSERT INTO readings (meter_id, value, reading_date, is_verified, photo_url) VALUES ($1, $2, CURRENT_DATE, FALSE, $3)',
            [meter_id, stan, zdjecie_url || null]
        );

        res.json({ message: 'Twój odczyt i zdjęcie zostały wysłane. Oczekują na weryfikację przez Inkasenta.' });
    } catch (err) {
        console.error('Błąd zapisu odczytu z eBOK:', err);
        res.status(500).json({ error: 'Wystąpił błąd serwera. Spróbuj ponownie.' });
    }
};

module.exports = postOdczyt;