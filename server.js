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

// sprawdza uprawnienia zamiast roli, gdybysmy chcieli dodac inne role z konkretnnymi uprawnieniami to nie bedzie trzeba zmian w kodzie
const wymagaUprawnienia = (wymaganeUprawnienie) => {
    return (req, res, next) => {
        // Sprawdzamy, czy w tokenie uzytkownika znajduje się potrzebne uprawnienie
        if (req.user.permissions && req.user.permissions.includes(wymaganeUprawnienie)) {
            next(); // Wpuszczamy
        } else {
            res.status(403).send(`<h1>403 Zabronione</h1><p>Brakuje Ci uprawnienia: <b>${wymaganeUprawnienie}</b></p>`);
        }
    };
};

// ==========================================
// 1. STREFA GOSCIA
// ==========================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/cennik', (req, res) => res.sendFile(path.join(__dirname, 'views', 'cennik-gosc.html')));
app.get('/komunikaty', (req, res) => res.sendFile(path.join(__dirname, 'views', 'komunikaty-gosc.html')));
app.get('/logowanie', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));

// --- LOGOWANIE OPARTE NA STATUSACH I UPRAWNIENIACH ---
app.post('/zaloguj', async (req, res) => {
    const { email, haslo } = req.body;

    try {
        // 1. Szukamy uzytkownika
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.redirect('/logowanie?error=1'); 
        
        const user = result.rows[0];

        // 2. Sprawdzamy status konta
        if (user.status === 'pending') return res.send('Konto oczekuje na akceptację przez Administratora.');
        if (user.status === 'suspended') return res.send('Konto zostało zawieszone.');
        if (user.status !== 'active') return res.redirect('/logowanie?error=1');

        // 3. Sprawdzamy haslo
        const isMatch = await bcrypt.compare(haslo, user.password_hash);
        if (!isMatch) return res.redirect('/logowanie?error=1'); 

        // 4. KWERENDA ktora obiera unikalne uprawnienia ze WSZYSTKICH rol użytkownika
        const permResult = await pool.query(`
            SELECT DISTINCT p.name 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = $1
        `, [user.id]);
        
        const userPermissions = permResult.rows.map(row => row.name);

        // 5. Zamykamy uprawnienia w Tokenie JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, permissions: userPermissions }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.cookie('token', token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });

        // 6. Dynamiczne przekierowanie (Routing oparty na paczce uprawnień)
        if (userPermissions.includes('manage:users')) return res.redirect('/admin');
        if (userPermissions.includes('manage:readings')) return res.redirect('/technik');
        return res.redirect('/ebok'); // Domyślny ekran dla mieszkańca

    } catch (err) {
        console.error('Błąd logowania:', err);
        res.status(500).send('Błąd wewnętrzny serwera');
    }
});

// ==========================================
// 2. STREFA MIESZKAŃCA (Zabezpieczona uprawnieniem: read:invoices)
// ==========================================
app.get('/ebok', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok.html')));
app.get('/ebok/cennik', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-cennik.html')));
app.get('/ebok/komunikaty', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-komunikaty.html')));
app.get('/ebok/odczyt', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-odczyt.html')));
app.get('/ebok/historia', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-historia.html')));
app.get('/ebok/faktury', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-faktury.html')));
app.get('/ebok/awarie', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-awarie.html')));
app.get('/ebok/archiwum', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-archiwum.html')));
app.get('/ebok/lojalnosc', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'ebok-lojalnosc.html')));

// ==========================================
// 3. STREFA INKASENTA (Technik)
// ==========================================
app.get('/technik', weryfikujToken, wymagaUprawnienia('manage:readings'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'technik.html')));
app.get('/technik/mapa', weryfikujToken, wymagaUprawnienia('read:map'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'technik-mapa.html')));
app.get('/technik/klienci', weryfikujToken, wymagaUprawnienia('manage:readings'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'technik-klienci.html')));
app.get('/technik/wprowadz', weryfikujToken, wymagaUprawnienia('manage:readings'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'technik-wprowadz.html')));
app.get('/technik/raportuj', weryfikujToken, wymagaUprawnienia('report:incidents'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'technik-raportuj.html')));

// ==========================================
// 4. STREFA URZĘDNIKA (Admin)
// ==========================================
app.get('/admin', weryfikujToken, wymagaUprawnienia('manage:users'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin.html')));
app.get('/admin/uzytkownicy', weryfikujToken, wymagaUprawnienia('manage:users'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-uzytkownicy.html')));
app.get('/admin/biling', weryfikujToken, wymagaUprawnienia('manage:invoices'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-biling.html')));
app.get('/admin/analityka', weryfikujToken, wymagaUprawnienia('manage:users'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-analityka.html')));
app.get('/admin/mapa', weryfikujToken, wymagaUprawnienia('manage:incidents'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-mapa.html')));
app.get('/admin/komunikacja', weryfikujToken, wymagaUprawnienia('manage:announcements'), (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-komunikacja.html')));

// --- WYLOGOWANIE ---
app.get('/wyloguj', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

app.listen(port, () => console.log(`Serwer śmiga na porcie ${port}`));