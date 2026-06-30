const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
 
const postRejestracja = async (req, res) => {
    const { email, haslo, powtorz_haslo, role_id, numer_licznika } = req.body;
 
    if (!email || !haslo || !powtorz_haslo) {
        return res.status(400).json({ error: 'Wypełnij wszystkie pola.' });
    }
    if (haslo !== powtorz_haslo) {
        return res.status(400).json({ error: 'Podane hasła nie są identyczne!' });
    }
    if (!numer_licznika || !numer_licznika.trim()) {
        return res.status(400).json({ error: 'Podaj numer seryjny licznika.' });
    }
 
    const serial = numer_licznika.trim();
    const client = await pool.connect();
 
    try {
        const czyIstnieje = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (czyIstnieje.rows.length > 0) {
            return res.status(409).json({ error: 'Konto z tym adresem e-mail już istnieje.' });
        }
 
        await client.query('BEGIN');
 
        // Blokujemy wiersz licznika, żeby uniknąć wyścigu przy równoległej rejestracji na ten sam numer
        const licznikResult = await client.query(
            `SELECT id, user_id FROM meters WHERE serial_number = $1 FOR UPDATE`,
            [serial]
        );
 
        if (licznikResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Nie znaleziono licznika o podanym numerze seryjnym. Sprawdź numer i spróbuj ponownie.' });
        }
 
        const licznik = licznikResult.rows[0];
 
        if (licznik.user_id !== null) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Ten licznik jest już przypisany do innego konta.' });
        }
 
        const sol = await bcrypt.genSalt(12);
        const zhashowaneHaslo = await bcrypt.hash(haslo, sol);
 
        const insertUser = await client.query(
            `INSERT INTO users (email, password_hash, status) VALUES ($1, $2, 'active') RETURNING id`,
            [email, zhashowaneHaslo]
        );
        const noweId = insertUser.rows[0].id;
 
        await client.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
            [noweId, role_id || 3]
        );
 
        await client.query(
            `UPDATE meters SET user_id = $1 WHERE id = $2`,
            [noweId, licznik.id]
        );
 
        await client.query('COMMIT');
        return res.json({ message: 'Konto zostało pomyślnie założone i powiązane z licznikiem! Możesz się zalogować.' });
 
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Błąd podczas ROLLBACK:', rollbackErr);
        }
        console.error('Błąd podczas rejestracji:', err);
        return res.status(500).json({ error: 'Wystąpił problem z serwerem. Spróbuj ponownie później.' });
    } finally {
        client.release();
    }
};
 
module.exports = postRejestracja;