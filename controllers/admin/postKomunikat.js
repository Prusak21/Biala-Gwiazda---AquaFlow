const pool = require('../../config/db');

const postKomunikat = async (req, res) => {
    const { title, recipient, content } = req.body;

    if (!title || !content) return res.status(400).json({ error: 'Tytuł i treść są wymagane!' });

    try {
        let finalTitle = title;
        if (recipient === 'srodmiescie') finalTitle = '[ŚRÓDMIEŚCIE] ' + title;
        if (recipient === 'szczakowa') finalTitle = '[SZCZAKOWA] ' + title;

        await pool.query(`
            INSERT INTO announcements (title, content, created_by, valid_to) 
            VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL '14 days')
        `, [finalTitle, content, req.user.id]);

        res.json({ message: 'Komunikat został pomyślnie wysłany i jest już widoczny w systemie.' });
    } catch (err) {
        console.error('Błąd dodawania komunikatu:', err);
        res.status(500).json({ error: 'Wystąpił błąd podczas wysyłania komunikatu.' });
    }
};

module.exports = postKomunikat;