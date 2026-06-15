require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

// Inicjalizacja aplikacji
const app = express();
const port = process.env.PORT || 8080;

// ==========================================
// 1. KONFIGURACJA I MIDDLEWARE
// ==========================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Pozwala na odbieranie danych w formacie JSON
app.use(cookieParser()); // Pozwala na odczytywanie tokenów JWT z ciasteczek

// ==========================================
// 2. IMPORTY MODUŁÓW ROUTINGU
// ==========================================
// Widoki HTML (Strony internetowe)
const authRoutes = require('./routes/auth');
const residentRoutes = require('./routes/viewResident');
const technikRoutes = require('./routes/viewTechnik');
const adminRoutes = require('./routes/viewAdmin');

// Endpointy REST API (Wymiana danych)
const apiPublicRoutes = require('./routes/apiPublic');
const apiEbokRoutes = require('./routes/apiEbok');
const apiTechnikRoutes = require('./routes/apiTechnik');
const apiAdminRoutes = require('./routes/apiAdmin');

// ==========================================
// 3. REJESTRACJA TRAS (PODPINANIE DO SERWERA)
// ==========================================
// Trasy serwujące widoki HTML
app.use('/', authRoutes);
app.use('/', residentRoutes);
app.use('/', technikRoutes);
app.use('/', adminRoutes);

// Trasy serwujące dane w formacie JSON (API)
app.use('/api/public', apiPublicRoutes);
app.use('/api', apiEbokRoutes);
app.use('/api', apiTechnikRoutes);
app.use('/api/admin', apiAdminRoutes);

// ==========================================
// 4. PLIKI STATYCZNE I START SERWERA
// ==========================================
// Udostępniamy pliki z folderu "views" (np. style CSS, obrazki)
app.use(express.static(path.join(__dirname, 'views')));

app.listen(port, () => {
    console.log(`=========================================`);
    console.log(`✅ Serwer AquaFlow śmiga na porcie ${port}`);
    console.log(`✅ Architektura MVC załadowana pomyślnie!`);
    console.log(`=========================================`);
});