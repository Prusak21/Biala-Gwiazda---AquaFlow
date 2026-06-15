const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

const putUzytkownik = async (req, res) => {
    const { email, haslo, role_id, status } = req.body;
    const userId = req.params.id;

    try {
        await pool.query('BEGIN');

        await pool.query('UPDATE users SET email = $1, status = $2 WHERE id = $3', [email, status, userId]);

        if (haslo && haslo.trim() !== '') {
            const sol = await bcrypt.genSalt(12);
            const zhashowane = await bcrypt.hash(haslo, sol);
            await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [zhashowane, userId]);
        }

        await pool.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
        await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, role_id]);

        await pool.query('COMMIT');
        res.json({ message: 'Dane zaktualizowane pomyślnie!' });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: 'Błąd aktualizacji danych.' });
    }
};

module.exports = putUzytkownik;