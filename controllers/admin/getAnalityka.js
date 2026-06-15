const pool = require('../../config/db');

const getAnalityka = async (req, res) => {
    try {
        const zuzycieQuery = await pool.query('SELECT COALESCE(SUM(consumption_m3), 0) AS total_out FROM invoices');
        const wodaZuzyta = parseFloat(zuzycieQuery.rows[0].total_out) || 0;

        const wodaWtloczona = wodaZuzyta * 1.15;
        const stratyOgolem = wodaWtloczona - wodaZuzyta;
        const procentStrat = wodaWtloczona === 0 ? 0 : (stratyOgolem / wodaWtloczona) * 100;

        const sektory = [
            { nazwa: 'Śródmieście', wtloczono: wodaWtloczona * 0.45, zuzyto: wodaZuzyta * 0.38 },
            { nazwa: 'Szczakowa', wtloczono: wodaWtloczona * 0.30, zuzyto: wodaZuzyta * 0.28 },
            { nazwa: 'Podłęże', wtloczono: wodaWtloczona * 0.25, zuzyto: wodaZuzyta * 0.34 }
        ].map(s => {
            const strataM3 = s.wtloczono - s.zuzyto;
            const strataProc = s.wtloczono === 0 ? 0 : (strataM3 / s.wtloczono) * 100;
            return {
                nazwa: s.nazwa, wtloczono: s.wtloczono.toFixed(2), zuzyto: s.zuzyto.toFixed(2),
                strata_m3: strataM3.toFixed(2), strata_proc: strataProc.toFixed(2)
            };
        });

        res.json({
            ogolem: {
                wtloczono: wodaWtloczona.toFixed(2), zuzyto: wodaZuzyta.toFixed(2),
                straty: stratyOgolem.toFixed(2), procent: procentStrat.toFixed(2)
            },
            sektory: sektory
        });
    } catch (err) {
        console.error('Błąd modułu analityki:', err);
        res.status(500).json({ error: 'Nie udało się wygenerować raportu analitycznego.' });
    }
};

module.exports = getAnalityka;