const pool = require('../../config/db');

const getFaktury = async (req, res) => {
    try {
        const zapytanie = `
            SELECT id, period_start, period_end, (consumption_m3 * price_per_m3 * 1.08) AS kwota_brutto, due_date, status
            FROM invoices
            WHERE user_id = $1
            ORDER BY period_end DESC;
        `;
        const result = await pool.query(zapytanie, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Błąd pobierania faktur:', err);
        res.status(500).json({ error: 'Nie udało się pobrać listy faktur.' });
    }
};

module.exports = getFaktury;