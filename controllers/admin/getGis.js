const pool = require('../../config/db');

const getGis = async (req, res) => {
    try {
        const nodesQuery = await pool.query(`SELECT id, name, ST_AsGeoJSON(geom) AS lokalizacja FROM network_nodes`);
        const metersQuery = await pool.query(`
            SELECT m.id, m.serial_number, ST_AsGeoJSON(m.geom) AS lokalizacja, u.email
            FROM meters m LEFT JOIN users u ON m.user_id = u.id
        `);
        const incidentsQuery = await pool.query(`
            SELECT id, current_status, ST_AsGeoJSON(geom) AS lokalizacja
            FROM incidents WHERE current_status != 'resolved' AND geom IS NOT NULL
        `);

        res.json({ wezly: nodesQuery.rows, liczniki: metersQuery.rows, awarie: incidentsQuery.rows });
    } catch (err) {
        console.error('Błąd pobierania danych GIS:', err);
        res.status(500).json({ error: 'Nie udało się załadować danych przestrzennych z bazy PostGIS.' });
    }
};

module.exports = getGis;