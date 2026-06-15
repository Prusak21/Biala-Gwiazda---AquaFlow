const express = require('express');
const path = require('path');
const router = express.Router();

const postRejestracja = require('../controllers/auth/postRejestracja');
const postLogowanie = require('../controllers/auth/postLogowanie'); // <-- Dodany import logowania

router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views', 'index.html')));
router.get('/cennik', (req, res) => res.sendFile(path.join(__dirname, '../views', 'cennik-gosc.html')));
router.get('/komunikaty', (req, res) => res.sendFile(path.join(__dirname, '../views', 'komunikaty-gosc.html')));
router.get('/logowanie', (req, res) => res.sendFile(path.join(__dirname, '../views', 'login.html')));
router.get('/rejestracja', (req, res) => res.sendFile(path.join(__dirname, '../views', 'rejestracja.html')));

router.get('/wyloguj', (req, res) => {
    res.clearCookie('token');
    res.redirect('/logowanie');
});

router.post('/zarejestruj', postRejestracja);
router.post('/zaloguj', postLogowanie); // <-- Brakujący endpoint

module.exports = router;