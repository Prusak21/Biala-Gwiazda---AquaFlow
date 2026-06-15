const express = require('express');
const path = require('path');
const router = express.Router();
const { weryfikujToken, wymagaUprawnienia } = require('../middlewares/authMiddleware');

router.get('/admin', weryfikujToken, wymagaUprawnienia('manage:users'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'admin.html')));
router.get('/admin/uzytkownicy', weryfikujToken, wymagaUprawnienia('manage:users'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'admin-uzytkownicy.html')));
router.get('/admin/biling', weryfikujToken, wymagaUprawnienia('manage:invoices'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'admin-biling.html')));
router.get('/admin/analityka', weryfikujToken, wymagaUprawnienia('manage:users'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'admin-analityka.html')));
router.get('/admin/mapa', weryfikujToken, wymagaUprawnienia('manage:incidents'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'admin-mapa.html')));
router.get('/admin/komunikacja', weryfikujToken, wymagaUprawnienia('manage:announcements'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'admin-komunikacja.html')));

module.exports = router;