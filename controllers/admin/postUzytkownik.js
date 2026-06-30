const pool = require('../../config/db');
const bcrypt = require('bcryptjs'); // Wymagane do szyfrowania hasła!

const postUzytkownik = async (req, res) => {
    const { email, haslo, role_id, status } = req.body;
    if (!email || !haslo) return res.status(400).json({ error: 'Email i hasło są wymagane!' });

    try {
        await pool.query('BEGIN');
        
        const spr = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (spr.rows.length > 0) throw new Error('Ten adres e-mail jest już zajęty.');

        const sol = await bcrypt.genSalt(12);
        const zhashowane = await bcrypt.hash(haslo, sol);

        const insert = await pool.query(
            'INSERT INTO users (email, password_hash, status) VALUES ($1, $2, $3) RETURNING id',
            [email, zhashowane, status || 'active']
        );
        const noweId = insert.rows[0].id;

        await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [noweId, role_id]);
        
        await pool.query('COMMIT');
        res.json({ message: 'Użytkownik dodany pomyślnie!' });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: err.message || 'Błąd podczas dodawania użytkownika.' });
    }
};

module.exports = postUzytkownik;