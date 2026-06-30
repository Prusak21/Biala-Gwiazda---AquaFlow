// Plik: middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'zapasowy_sekret_dla_testow_lokalnych';

const weryfikujToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/logowanie');
    
    jwt.verify(token, JWT_SECRET, (err, zdekodowaneDane) => {
        if (err) { 
            res.clearCookie('token'); 
            return res.redirect('/logowanie'); 
        }
        req.user = zdekodowaneDane;
        next();
    });
};

const wymagaUprawnienia = (wymaganeUprawnienie) => {
    return (req, res, next) => {
        if (req.user.permissions && req.user.permissions.includes(wymaganeUprawnienie)) {
            next(); 
        } else {
            res.status(403).send(`<h1>403 Zabronione</h1><p>Brakuje Ci uprawnienia: <b>${wymaganeUprawnienie}</b></p>`);
        }
    };
};

// Eksportujemy obie funkcje jako obiekt
module.exports = {
    weryfikujToken,
    wymagaUprawnienia
};