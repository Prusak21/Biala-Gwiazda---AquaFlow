const pool = require('../../config/db');

const getKomunikaty = async (req, res) => {
    try {
        const zapytanie = `
            SELECT title, content, valid_to 
            FROM announcements 
            WHERE valid_to >= CURRENT_DATE 
            ORDER BY valid_to ASC
        `;
        const result = await pool.query(zapytanie);
        res.json(result.rows);
    } catch (err) {
        console.error('Błąd pobierania komunikatów dla gości:', err);
        res.status(500).json({ error: 'Nie udało się pobrać komunikatów z systemu.' });
    }
};

module.exports = getKomunikaty;