const express = require('express');
const router = express.Router();

const getCennik = require('../controllers/public/getCennik');
const getKomunikaty = require('../controllers/public/getKomunikaty');

// TRASY PUBLICZNE (Prefiks globalny ustalony w server.js: /api/public)
router.get('/cennik', getCennik);
router.get('/komunikaty', getKomunikaty);

module.exports = router;