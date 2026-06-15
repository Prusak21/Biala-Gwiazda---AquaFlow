const express = require('express');
const path = require('path');
const router = express.Router();
const { weryfikujToken, wymagaUprawnienia } = require('../middlewares/authMiddleware');

router.get('/technik', weryfikujToken, wymagaUprawnienia('manage:readings'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'technik.html')));
router.get('/technik/mapa', weryfikujToken, wymagaUprawnienia('read:map'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'technik-mapa.html')));
router.get('/technik/klienci', weryfikujToken, wymagaUprawnienia('manage:readings'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'technik-klienci.html')));
router.get('/technik/wprowadz', weryfikujToken, wymagaUprawnienia('manage:readings'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'technik-wprowadz.html')));
router.get('/technik/raportuj', weryfikujToken, wymagaUprawnienia('manage:incidents'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'technik-raportuj.html')));

module.exports = router;