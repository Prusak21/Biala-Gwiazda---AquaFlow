const pool = require('../../config/db');

const getCennik = async (req, res) => {
    try {
        const zapytanie = `
            SELECT name AS nazwa, price_per_m3 AS cena, valid_from AS wazne_od, valid_to AS wazne_do
            FROM water_rates
            ORDER BY valid_from DESC;
        `;
        const result = await pool.query(zapytanie);

        const oplatyStale = [
            { nazwa: "Opłata abonamentowa (miesięcznie)", kwota: 12.50 },
            { nazwa: "Opłata za utrzymanie łącza e-BOK", kwota: 0.00 },
            { nazwa: "Wezwanie do zapłaty (monit)", kwota: 15.00 }
        ];

        res.json({ taryfy: result.rows, oplaty: oplatyStale });
    } catch (err) {
        console.error('Błąd pobierania cennika:', err);
        res.status(500).json({ error: 'Nie udało się pobrać aktualnego cennika.' });
    }
};

module.exports = getCennik;