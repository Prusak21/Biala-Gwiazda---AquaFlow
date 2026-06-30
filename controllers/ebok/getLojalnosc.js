const pool = require('../../config/db');

const getLojalnosc = async (req, res) => {
    try {
        const result = await pool.query("SELECT count(*) as paid_invoices FROM invoices WHERE user_id = $1 AND status = 'paid'", [req.user.id]);
        const paidCount = parseInt(result.rows[0].paid_invoices);
        
        let punkty = 50 + (paidCount * 150);
        let poziom = "Brązowa Kropla";
        let nastepny_poziom = "Srebrna Kropla";
        let brakuje = 300 - punkty;
        let procent = (punkty / 300) * 100;

        if (punkty >= 300 && punkty < 600) {
            poziom = "Srebrna Kropla";
            nastepny_poziom = "Złota Kropla";
            brakuje = 600 - punkty;
            procent = ((punkty - 300) / 300) * 100;
        } else if (punkty >= 600) {
            poziom = "Złota Kropla";
            nastepny_poziom = "Diamentowa Kropla";
            brakuje = 1000 - punkty;
            procent = punkty >= 1000 ? 1000 : ((punkty - 600) / 400) * 100;
            if (punkty >= 1000) {
                poziom = "Diamentowa Kropla";
                nastepny_poziom = "MAX";
                brakuje = 0;
                procent = 100;
            }
        }

        const nagrody = [
            { id: 1, nazwa: "Ekologiczny perlator do kranu", koszt: 150, ikona: "🚰" },
            { id: 2, nazwa: "Zniżka -5% na kolejną fakturę", koszt: 300, ikona: "📄" },
            { id: 3, nazwa: "Darmowy przegląd instalacji", koszt: 500, ikona: "🔧" },
            { id: 4, nazwa: "Zbiornik na deszczówkę (100L)", koszt: 1000, ikona: "🌧️" }
        ];

        res.json({ punkty, poziom, nastepny_poziom, brakuje, procent, nagrody });
    } catch (err) {
        console.error('Błąd w module lojalnościowym:', err);
        res.status(500).json({ error: 'Nie udało się pobrać danych programu lojalnościowego.' });
    }
};

module.exports = getLojalnosc;