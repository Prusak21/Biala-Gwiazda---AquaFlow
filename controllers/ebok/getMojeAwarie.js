const pool = require('../../config/db');

const getMojeAwarie = async (req, res) => {
    try {
        const zapytanie = `
            SELECT 
                i.id,
                i.created_at AS data_zgloszenia,
                i.current_status AS status,
                (
                    SELECT description 
                    FROM incident_updates iu 
                    WHERE iu.incident_id = i.id 
                    ORDER BY created_at ASC 
                    LIMIT 1
                ) AS oryginalny_opis,
                (
                    SELECT created_at 
                    FROM incident_updates iu 
                    WHERE iu.incident_id = i.id 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) AS data_ostatniej_zmiany
            FROM incidents i
            WHERE i.reported_by = $1
            ORDER BY i.created_at DESC;
        `;

        const result = await pool.query(zapytanie, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Błąd pobierania archiwum awarii:', err);
        res.status(500).json({ error: 'Nie udało się pobrać archiwum zgłoszeń.' });
    }
};

module.exports = getMojeAwarie;