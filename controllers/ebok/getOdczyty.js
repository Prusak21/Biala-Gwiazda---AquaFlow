const pool = require('../../config/db');

const getOdczyty = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Pobieramy informacje o liczniku przypisanym do użytkownika
        const licznikResult = await pool.query(
            'SELECT id, serial_number FROM meters WHERE user_id = $1', 
            [userId]
        );

        if (licznikResult.rows.length === 0) {
            return res.json({ odczyty: [], numerLicznika: 'Brak przypisanego licznika' });
        }

        const licznik = licznikResult.rows[0];

        // 2. Pobieramy odczyty dla tego konkretnego licznika
        const odczytyResult = await pool.query(
            `SELECT id, reading_date, value, is_verified 
             FROM readings 
             WHERE meter_id = $1 
             ORDER BY reading_date DESC`,
            [licznik.id]
        );

        res.json({ 
            odczyty: odczytyResult.rows, 
            numerLicznika: licznik.serial_number 
        });

    } catch (err) {
        console.error('Błąd pobierania odczytów:', err);
        res.status(500).json({ error: 'Nie udało się pobrać historii odczytów.' });
    }
};

module.exports = getOdczyty;