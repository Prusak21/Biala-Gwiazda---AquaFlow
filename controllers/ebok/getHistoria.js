const pool = require('../../config/db');

const getHistoria = async (req, res) => {
    try {
        const zapytanie = `
            SELECT period_end, consumption_m3, (consumption_m3 * price_per_m3) AS kwota_netto, (consumption_m3 * price_per_m3 * 1.08) AS kwota_brutto
            FROM invoices
            WHERE user_id = $1
            ORDER BY period_end ASC;
        `;
        const result = await pool.query(zapytanie, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Błąd pobierania historii:', err);
        res.status(500).json({ error: 'Nie udało się pobrać historii zużycia.' });
    }
};

module.exports = getHistoria;