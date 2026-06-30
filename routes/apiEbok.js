// Plik: routes/apiEbok.js
const express = require('express');
const router = express.Router();
const { weryfikujToken, wymagaUprawnienia } = require('../middlewares/authMiddleware');

// IMPORT KONTROLERÓW WĘZŁA E-BOK
const getDashboardInfo = require('../controllers/ebok/getDashboardInfo');
const getMojeAwarie = require('../controllers/ebok/getMojeAwarie');
const postAwaria = require('../controllers/ebok/postAwaria');
const getCennik = require('../controllers/ebok/getCennik');
const getFaktury = require('../controllers/ebok/getFaktury');
const getHistoria = require('../controllers/ebok/getHistoria');
const getKomunikatyFaktury = require('../controllers/ebok/getKomunikatyFaktury');
const getLojalnosc = require('../controllers/ebok/getLojalnosc');
const getOdczyty = require('../controllers/ebok/getOdczyty');
const postOdczyt = require('../controllers/ebok/postOdczyt');

// ==========================================
// TRASY INTERFEJSU API E-BOK (Prefiks globalny: /api)
// ==========================================

// Moduł główny i awarie
router.get('/ebok/dashboard-info', weryfikujToken, wymagaUprawnienia('read:invoices'), getDashboardInfo);
router.get('/ebok/moje-awarie', weryfikujToken, wymagaUprawnienia('read:invoices'), getMojeAwarie);
router.post('/ebok/awarie', weryfikujToken, wymagaUprawnienia('report:incidents'), postAwaria);

// Finanse, taryfikatory i analityka wykresów
router.get('/ebok/cennik', weryfikujToken, wymagaUprawnienia('read:invoices'), getCennik);
router.get('/ebok/faktury', weryfikujToken, wymagaUprawnienia('read:invoices'), getFaktury);
router.get('/ebok/historia', weryfikujToken, wymagaUprawnienia('read:invoices'), getHistoria);
router.get('/ebok/komunikaty-faktury', weryfikujToken, wymagaUprawnienia('read:invoices'), getKomunikatyFaktury);

// Programy lojalnościowe i gospodarka odczytowa
router.get('/ebok/lojalnosc', weryfikujToken, wymagaUprawnienia('read:invoices'), getLojalnosc);
router.get('/ebok/odczyty', weryfikujToken, wymagaUprawnienia('read:invoices'), getOdczyty);
router.post('/ebok/odczyty', weryfikujToken, wymagaUprawnienia('read:invoices'), postOdczyt);

module.exports = router;