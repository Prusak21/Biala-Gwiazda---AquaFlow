const pool = require('../../config/db');

const postAwaria = async (req, res) => {
    const { typ, nrLicznika, pesel, opis } = req.body;
    const mieszkaniec_id = req.user.id;

    if (!typ || !nrLicznika || !pesel) {
        return res.status(400).json({ error: 'Proszę wypełnić wszystkie wymagane pola autoryzacyjne.' });
    }

    try {
        await pool.query('BEGIN');

        const licznikCheck = await pool.query(`
            SELECT id, geom 
            FROM meters 
            WHERE serial_number = $1 AND user_id = $2
        `, [nrLicznika, mieszkaniec_id]);

        if (licznikCheck.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(403).json({ error: 'Podany numer licznika jest nieprawidłowy lub nie należy do Twojego konta.' });
        }

        const lokalizacja = licznikCheck.rows[0].geom;

        const insertIncident = await pool.query(`
            INSERT INTO incidents (reported_by, geom, current_status)
            VALUES ($1, $2, 'reported')
            RETURNING id
        `, [mieszkaniec_id, lokalizacja]);
        
        const nowaAwariaId = insertIncident.rows[0].id;

        const pelnyOpis = `[e-BOK: ${typ}] ${opis || 'Brak dodatkowego opisu.'}`;
        await pool.query(`
            INSERT INTO incident_updates (incident_id, updated_by, description)
            VALUES ($1, $2, $3)
        `, [nowaAwariaId, mieszkaniec_id, pelnyOpis]);

        await pool.query('COMMIT');
        res.json({ message: 'Zgłoszenie zostało pomyślnie przyjęte i przekazane do działu technicznego.' });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Błąd podczas zgłaszania awarii e-BOK:', err);
        res.status(500).json({ error: 'Wystąpił błąd serwera. Spróbuj ponownie później.' });
    }
};

module.exports = postAwaria;