const pool = require('../../config/db');

const getDashboard = async (req, res) => {
    try {
        const usersCount = await pool.query('SELECT COUNT(*) AS total FROM users');
        const consumptionSum = await pool.query('SELECT COALESCE(SUM(consumption_m3), 0) AS total FROM invoices');
        const activeIncidents = await pool.query("SELECT COUNT(*) AS total FROM incidents WHERE current_status != 'resolved'");
        
        const debtSum = await pool.query(`
            SELECT COALESCE(SUM(consumption_m3 * price_per_m3 * 1.08), 0) AS total 
            FROM invoices 
            WHERE status IN ('unpaid', 'overdue')
        `);

        const recentIncidents = await pool.query("SELECT '⚠️ Zgłoszono nową awarię #' || id AS opis FROM incidents ORDER BY id DESC LIMIT 2");
        const recentInvoices = await pool.query("SELECT '📄 Wygenerowano fakturę dla ID: ' || user_id AS opis FROM invoices ORDER BY id DESC LIMIT 2");
        
        const activities = [...recentIncidents.rows, ...recentInvoices.rows];

        res.json({
            users: usersCount.rows[0].total,
            consumption: parseFloat(consumptionSum.rows[0].total).toFixed(2),
            incidents: activeIncidents.rows[0].total,
            debt: parseFloat(debtSum.rows[0].total).toFixed(2),
            activities: activities
        });
    } catch (err) {
        console.error('Błąd pobierania statystyk admina:', err);
        res.status(500).json({ error: 'Nie udało się załadować danych dashboardu.' });
    }
};

module.exports = getDashboard;