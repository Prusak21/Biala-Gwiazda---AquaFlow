const express = require('express');
const router = express.Router();
const { weryfikujToken, wymagaUprawnienia } = require('../middlewares/authMiddleware');

// IMPORTUJEMY KONTROLERY
const getDashboard = require('../controllers/technik/getDashboard');
const getAwarie = require('../controllers/technik/getAwarie');
const getLiczniki = require('../controllers/technik/getLiczniki');
const getMapaPunkty = require('../controllers/technik/getMapaPunkty');
const postOdczyt = require('../controllers/technik/postOdczyt');
const postAwaria = require('../controllers/technik/postAwaria');

// ==========================================
// TRASY REST API TECHNIKA (Automatyczny prefiks /api z server.js)
// ==========================================

// Pobieranie danych (GET)
router.get('/technik/dashboard', weryfikujToken, wymagaUprawnienia('manage:readings'), getDashboard);
router.get('/awarie', weryfikujToken, wymagaUprawnienia('manage:incidents'), getAwarie);
router.get('/technik/liczniki', weryfikujToken, wymagaUprawnienia('manage:readings'), getLiczniki);
router.get('/technik/mapa-punkty', weryfikujToken, wymagaUprawnienia('read:map'), getMapaPunkty);

// Wysyłanie danych z formularzy (POST)
router.post('/technik/odczyty', weryfikujToken, wymagaUprawnienia('manage:readings'), postOdczyt);
router.post('/technik/awarie', weryfikujToken, wymagaUprawnienia('manage:incidents'), postAwaria);

module.exports = router;