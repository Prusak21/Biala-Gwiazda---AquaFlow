const pool = require('../../config/db');

const deleteUzytkownik = async (req, res) => {
    try {
        await pool.query('BEGIN');
        await pool.query('DELETE FROM user_roles WHERE user_id = $1', [req.params.id]);
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        await pool.query('COMMIT');
        res.json({ message: 'Użytkownik usunięty.' });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: 'Nie można usunąć użytkownika (powiązane faktury/odczyty).' });
    }
};

module.exports = deleteUzytkownik;