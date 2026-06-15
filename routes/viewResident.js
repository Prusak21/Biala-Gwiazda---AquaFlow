const express = require('express');
const path = require('path');
const router = express.Router();
const { weryfikujToken, wymagaUprawnienia } = require('../middlewares/authMiddleware');

router.get('/ebok', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'ebok.html')));
router.get('/ebok/cennik', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'ebok-cennik.html')));
router.get('/ebok/komunikaty', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'ebok-komunikaty.html')));
router.get('/ebok/odczyt', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'ebok-odczyt.html')));
router.get('/ebok/historia', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'ebok-historia.html')));
router.get('/ebok/faktury', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'ebok-faktury.html')));
router.get('/ebok/awarie', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'ebok-awarie.html')));
router.get('/ebok/archiwum', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'ebok-archiwum.html')));
router.get('/ebok/lojalnosc', weryfikujToken, wymagaUprawnienia('read:invoices'), (req, res) => res.sendFile(path.join(__dirname, '../views', 'ebok-lojalnosc.html')));

module.exports = router;