const pool = require('../../config/db');

const getDashboardInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const faktury = await pool.query(
            "SELECT COUNT(*) as count FROM invoices WHERE user_id = $1 AND status IN ('unpaid', 'overdue')", 
            [userId]
        );
        const zaleglosci = parseInt(faktury.rows[0].count);
        
        const komunikaty = await pool.query(
            "SELECT COUNT(*) as count FROM announcements WHERE valid_to >= CURRENT_DATE"
        );
        const noweKomunikaty = parseInt(komunikaty.rows[0].count);

        let alertTekst = '';
        let alertKolor = '';

        if (zaleglosci > 0) {
            alertTekst = `⚠️ Uwaga: Posiadasz <strong>${zaleglosci}</strong> nieopłaconą fakturę w systemie. Prosimy o uregulowanie płatności.`;
            alertKolor = '#e74c3c';
        } else if (noweKomunikaty > 0) {
            alertTekst = `📢 W systemie opublikowano <strong>${noweKomunikaty}</strong> nowe ogłoszenie/a. Sprawdź zakładkę Komunikaty.`;
            alertKolor = '#f39c12';
        } else {
            alertTekst = `✅ Wszystko w porządku! Twoje rachunki są opłacone, a na sieci nie ma utrudnień.`;
            alertKolor = '#27ae60';
        }

        res.json({ alertTekst, alertKolor });
    } catch (err) {
        console.error('Błąd pobierania danych dashboardu eBOK:', err);
        res.status(500).json({ error: 'Nie udało się pobrać statusu konta.' });
    }
};

module.exports = getDashboardInfo;