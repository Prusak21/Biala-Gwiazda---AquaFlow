const pool = require('../../config/db');

const getUzytkownicy = async (req, res) => {
    try {
        const zapytanie = `
            SELECT 
                u.id, 
                u.email, 
                u.status, 
                r.id AS role_id,
                r.name AS rola
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            ORDER BY u.id ASC;
        `;
        const result = await pool.query(zapytanie);
        res.json(result.rows);
    } catch (err) {
        console.error('Błąd pobierania użytkowników:', err);
        res.status(500).json({ error: 'Błąd serwera' });
    }
};

module.exports = getUzytkownicy;