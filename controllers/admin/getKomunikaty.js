const pool = require('../../config/db');

const getKomunikaty = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, content, created_at, valid_to 
            FROM announcements 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Błąd pobierania komunikatów:', err);
        res.status(500).json({ error: 'Błąd serwera' });
    }
};

module.exports = getKomunikaty;