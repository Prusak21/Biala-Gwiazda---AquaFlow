const express = require('express');
const router = express.Router();
const { weryfikujToken, wymagaUprawnienia } = require('../middlewares/authMiddleware');

// IMPORT KONTROLERÓW
const getDashboard = require('../controllers/admin/getDashboard');
const getUzytkownicy = require('../controllers/admin/getUzytkownicy');
const postUzytkownik = require('../controllers/admin/postUzytkownik');
const putUzytkownik = require('../controllers/admin/putUzytkownik');
const deleteUzytkownik = require('../controllers/admin/deleteUzytkownik');
const getGis = require('../controllers/admin/getGis');
const getKomunikaty = require('../controllers/admin/getKomunikaty');
const postKomunikat = require('../controllers/admin/postKomunikat');
const deleteKomunikat = require('../controllers/admin/deleteKomunikat');
const getBiling = require('../controllers/admin/getBiling');
const getAnalityka = require('../controllers/admin/getAnalityka');

// ==========================================
// TRASY API ADMINISTRATORA (Prefiks globalny: /api/admin)
// ==========================================

// Dashboard i GIS
router.get('/dashboard', weryfikujToken, wymagaUprawnienia('manage:users'), getDashboard);
router.get('/gis', weryfikujToken, wymagaUprawnienia('manage:users'), getGis);

// Użytkownicy (CRUD)
router.get('/uzytkownicy', weryfikujToken, wymagaUprawnienia('manage:users'), getUzytkownicy);
router.post('/uzytkownicy', weryfikujToken, wymagaUprawnienia('manage:users'), postUzytkownik);
router.put('/uzytkownicy/:id', weryfikujToken, wymagaUprawnienia('manage:users'), putUzytkownik);
router.delete('/uzytkownicy/:id', weryfikujToken, wymagaUprawnienia('manage:users'), deleteUzytkownik);

// Komunikaty
router.get('/komunikaty', weryfikujToken, wymagaUprawnienia('manage:users'), getKomunikaty);
router.post('/komunikaty', weryfikujToken, wymagaUprawnienia('manage:users'), postKomunikat);
router.delete('/komunikaty/:id', weryfikujToken, wymagaUprawnienia('manage:users'), deleteKomunikat);

// Biling i Analityka
router.get('/biling', weryfikujToken, wymagaUprawnienia('manage:users'), getBiling);
router.get('/analityka', weryfikujToken, wymagaUprawnienia('manage:users'), getAnalityka);

module.exports = router;