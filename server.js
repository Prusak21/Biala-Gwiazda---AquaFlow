require('dotenv').config(); // Ładowanie zmiennych z pliku .env
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg'); // Sterownik PostgreSQL
const bcrypt = require('bcryptjs'); // Biblioteka do hashowania haseł

const app = express();
const port = 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'zapasowy_sekret_dla_testow_lokalnych';

// --- POŁĄCZENIE Z BAZĄ DANYCH ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect()
    .then(() => console.log('✅ Połączono z bazą PostgreSQL (AquaFlow)!'))
    .catch(err => console.error('❌ Błąd połączenia z bazą:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Pozwala czytać zapytania JSON z frontendu
app.use(cookieParser());

// --- STRAŻNICY (Middlewares) ---
const weryfikujToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/logowanie');
    jwt.verify(token, JWT_SECRET, (err, zdekodowaneDane) => {
        if (err) { res.clearCookie('token'); return res.redirect('/logowanie'); }
        req.user = zdekodowaneDane;
        next();
    });
};

const tylkoAdmin = (req, res, next) => req.user.isAdmin ? next() : res.status(403).send('<h1>403</h1><p>Wymagane uprawnienia Admina.</p>');
const tylkoTechnik = (req, res, next) => (req.user.isTechnician || req.user.isAdmin) ? next() : res.status(403).send('<h1>403</h1><p>Wymagane uprawnienia Inkasenta.</p>');
const tylkoMieszkaniec = (req, res, next) => next();

// ==========================================
// 1. STREFA GOŚCIA
// ==========================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/cennik', (req, res) => res.sendFile(path.join(__dirname, 'views', 'cennik-gosc.html')));
app.get('/komunikaty', (req, res) => res.sendFile(path.join(__dirname, 'views', 'komunikaty-gosc.html')));
app.get('/logowanie', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));

// --- PRAWDZIWE LOGOWANIE Z BAZY DANYCH (Z DETEKTYWEM) ---
app.post('/zaloguj', async (req, res) => {
    const { email, haslo } = req.body;

    try {
        // 1. Szukamy użytkownika w bazie
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);
        
        if (result.rows.length === 0) {
            return res.redirect('/logowanie?error=1'); 
        }

        const user = result.rows[0];

        // 2. Porównujemy wpisane hasło z hashem z bazy
        const isMatch = await bcrypt.compare(haslo, user.password_hash);
        
        if (!isMatch) {
            return res.redirect('/logowanie?error=1'); 
        }

        // 3. Mapowanie ról z bazy (1 = Admin, 2 = Inkasent, 3 = Mieszkaniec)
        const isAdmin = user.role_id === 1;
        const isTechnician = user.role_id === 2;

        // 4. Generowanie Tokena
        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin, isTechnician }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.cookie('token', token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });

        // 5. Przekierowanie w zależności od roli
        if (isAdmin) return res.redirect('/admin');
        if (isTechnician) return res.redirect('/technik');
        return res.redirect('/ebok');

    } catch (err) {
        console.error('Błąd serwera podczas logowania:', err);
        res.status(500).send('Błąd wewnętrzny serwera');
    }
});

// ==========================================
// 2. STREFA MIESZKAŃCA (e-BOK)
// ==========================================
app.get('/ebok', weryfikujToken, tylkoMieszkaniec, (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok.html')));
app.get('/ebok/cennik', weryfikujToken, tylkoMieszkaniec, (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-cennik.html')));
app.get('/ebok/komunikaty', weryfikujToken, tylkoMieszkaniec, (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-komunikaty.html')));
app.get('/ebok/odczyt', weryfikujToken, tylkoMieszkaniec, (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-odczyt.html')));
app.get('/ebok/historia', weryfikujToken, tylkoMieszkaniec, (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-historia.html')));
app.get('/ebok/faktury', weryfikujToken, tylkoMieszkaniec, (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-faktury.html')));
app.get('/ebok/awarie', weryfikujToken, tylkoMieszkaniec, (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-awarie.html')));
app.get('/ebok/archiwum', weryfikujToken, tylkoMieszkaniec, (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-archiwum.html')));
app.get('/ebok/lojalnosc', weryfikujToken, tylkoMieszkaniec, (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-lojalnosc.html')));

// ==========================================
// 3. STREFA INKASENTA (Technik)
// ==========================================
app.get('/technik', weryfikujToken, tylkoTechnik, (req, res) => res.sendFile(path.join(__dirname, 'views', 'technik.html')));
app.get('/technik/mapa', weryfikujToken, tylkoTechnik, (req, res) => res.sendFile(path.join(__dirname, 'views', 'technik-mapa.html')));
app.get('/technik/klienci', weryfikujToken, tylkoTechnik, (req, res) => res.sendFile(path.join(__dirname, 'views', 'technik-klienci.html')));
app.get('/technik/wprowadz', weryfikujToken, tylkoTechnik, (req, res) => res.sendFile(path.join(__dirname, 'views', 'technik-wprowadz.html')));
app.get('/technik/raportuj', weryfikujToken, tylkoTechnik, (req, res) => res.sendFile(path.join(__dirname, 'views', 'technik-raportuj.html')));

// ==========================================
// 4. STREFA URZĘDNIKA (Admin)
// ==========================================
app.get('/admin', weryfikujToken, tylkoAdmin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin.html')));
app.get('/admin/uzytkownicy', weryfikujToken, tylkoAdmin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-uzytkownicy.html')));
app.get('/admin/biling', weryfikujToken, tylkoAdmin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-biling.html')));
app.get('/admin/analityka', weryfikujToken, tylkoAdmin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-analityka.html')));
app.get('/admin/mapa', weryfikujToken, tylkoAdmin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-mapa.html')));
app.get('/admin/komunikacja', weryfikujToken, tylkoAdmin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-komunikacja.html')));

// --- WYLOGOWANIE ---
app.get('/wyloguj', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

app.listen(port, () => console.log(`Serwer śmiga na porcie ${port}`));