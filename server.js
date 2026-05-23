const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = 8080;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- MOCK BAZY DANYCH ---
const mockUsers = [
    { id: 1, email: 'jan@kowalski.pl', haslo: '1234', isAdmin: false, isTechnician: false },
    { id: 2, email: 'admin@urzad.pl', haslo: 'admin1', isAdmin: true, isTechnician: false },
    { id: 3, email: 'technik@wodociagi.pl', haslo: 'tech123', isAdmin: false, isTechnician: true }
];

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

app.post('/zaloguj', (req, res) => {
    const user = mockUsers.find(u => u.email === req.body.email && u.haslo === req.body.haslo);
    if (user) {
        const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin, isTechnician: user.isTechnician }, JWT_SECRET, { expiresIn: '2h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
        if (user.isAdmin) return res.redirect('/admin');
        if (user.isTechnician) return res.redirect('/technik');
        return res.redirect('/ebok');
    }
    res.redirect('/logowanie');
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