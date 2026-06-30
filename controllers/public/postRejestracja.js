const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

const postRejestracja = async (req, res) => {
    const { email, haslo, powtorz_haslo, role_id } = req.body;

    if (!email || !haslo || !powtorz_haslo) {
        return res.status(400).json({ error: 'Wypełnij wszystkie pola.' });
    }
    if (haslo !== powtorz_haslo) {
        return res.status(400).json({ error: 'Podane hasła nie są identyczne!' });
    }

    try {
        const czyIstnieje = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (czyIstnieje.rows.length > 0) {
            return res.status(409).json({ error: 'Konto z tym adresem e-mail już istnieje.' });
        }

        const sol = await bcrypt.genSalt(12);
        const zhashowaneHaslo = await bcrypt.hash(haslo, sol);

        await pool.query('BEGIN');

        const insertUser = await pool.query(
            `INSERT INTO users (email, password_hash, status) VALUES ($1, $2, 'active') RETURNING id`,
            [email, zhashowaneHaslo]
        );
        const noweId = insertUser.rows[0].id;

        await pool.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
            [noweId, role_id || 3] 
        );

        await pool.query('COMMIT');
        res.json({ message: 'Konto zostało pomyślnie założone! Możesz się zalogować.' });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Błąd podczas rejestracji:', err);
        res.status(500).json({ error: 'Wystąpił problem z serwerem. Spróbuj ponownie później.' });
    }
};

module.exports = postRejestracja;