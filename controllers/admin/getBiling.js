const pool = require('../../config/db');

const getBiling = async (req, res) => {
    try {
        const podsumowanieQuery = await pool.query(`
            SELECT 
                COALESCE(SUM(consumption_m3 * price_per_m3 * 1.08), 0) AS total,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN consumption_m3 * price_per_m3 * 1.08 ELSE 0 END), 0) AS paid,
                COALESCE(SUM(CASE WHEN status IN ('unpaid', 'overdue') THEN consumption_m3 * price_per_m3 * 1.08 ELSE 0 END), 0) AS unpaid
            FROM invoices
        `);

        const fakturyQuery = await pool.query(`
            SELECT 
                i.id, u.email, i.period_start, i.period_end,
                (i.consumption_m3 * i.price_per_m3 * 1.08) AS kwota_brutto, i.status
            FROM invoices i
            LEFT JOIN users u ON i.user_id = u.id
            ORDER BY i.period_end DESC
        `);

        res.json({ podsumowanie: podsumowanieQuery.rows[0], faktury: fakturyQuery.rows });
    } catch (err) {
        console.error('Błąd pobierania danych bilingowych:', err);
        res.status(500).json({ error: 'Nie udało się załadować bilingów.' });
    }
};

module.exports = getBiling;