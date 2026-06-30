const pool = require('../../config/db');

const getKomunikatyFaktury = async (req, res) => {
    try {
        const komunikatyQuery = await pool.query(`
            SELECT title, content, valid_to FROM announcements 
            WHERE valid_to >= CURRENT_DATE ORDER BY valid_to ASC
        `);

        const fakturyQuery = await pool.query(`
            SELECT period_start, period_end, consumption_m3, (consumption_m3 * price_per_m3 * 1.08) AS kwota_brutto, status, due_date
            FROM invoices
            WHERE user_id = $1
            ORDER BY period_end DESC
        `, [req.user.id]);

        res.json({ komunikaty: komunikatyQuery.rows, faktury: fakturyQuery.rows });
    } catch (err) {
        console.error('Błąd pobierania komunikatów i faktur:', err);
        res.status(500).json({ error: 'Nie udało się pobrać danych z systemu.' });
    }
};

module.exports = getKomunikatyFaktury;