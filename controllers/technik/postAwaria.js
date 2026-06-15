const pool = require('../../config/db');

const postAwaria = async (req, res) => {
    const { lat, lng, rodzaj, opis } = req.body;
    const zglaszajacy_id = req.user.id;

    if (!rodzaj) {
        return res.status(400).json({ error: 'Musisz wybrać rodzaj usterki.' });
    }

    try {
        await pool.query('BEGIN');

        let nowaAwariaId;

        if (lat && lng) {
            const insertIncident = await pool.query(`
                INSERT INTO incidents (reported_by, geom, current_status)
                VALUES ($1, ST_GeomFromText($2, 4326), 'reported')
                RETURNING id
            `, [zglaszajacy_id, `POINT(${lng} ${lat})`]);
            nowaAwariaId = insertIncident.rows[0].id;
        } else {
            const insertIncident = await pool.query(`
                INSERT INTO incidents (reported_by, current_status)
                VALUES ($1, 'reported')
                RETURNING id
            `, [zglaszajacy_id]);
            nowaAwariaId = insertIncident.rows[0].id;
        }

        const pelnyOpis = `[${rodzaj}] ${opis || 'Brak dodatkowego opisu'}`;
        await pool.query(`
            INSERT INTO incident_updates (incident_id, updated_by, description)
            VALUES ($1, $2, $3)
        `, [nowaAwariaId, zglaszajacy_id, pelnyOpis]);

        await pool.query('COMMIT');
        res.json({ message: 'Awaria została pomyślnie zgłoszona i oznaczona na mapie!' });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Błąd podczas zgłaszania awarii:', err);
        res.status(500).json({ error: 'Błąd serwera. Nie udało się zapisać awarii.' });
    }
};

module.exports = postAwaria;