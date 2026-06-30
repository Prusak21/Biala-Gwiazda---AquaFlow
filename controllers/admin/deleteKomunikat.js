const pool = require('../../config/db');

const deleteKomunikat = async (req, res) => {
    try {
        await pool.query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
        res.json({ message: 'Komunikat został usunięty.' });
    } catch (err) {
        console.error('Błąd usuwania komunikatu:', err);
        res.status(500).json({ error: 'Nie można usunąć tego komunikatu.' });
    }
};

module.exports = deleteKomunikat;