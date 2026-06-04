const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// Memanggil fungsi langsung lewat objek induk 'healthController'
router.get('/health', healthController.getHealth);
router.get('/info', healthController.getApiInfo);
router.get('/echo/:msg', healthController.echoMessage);

// FORMAT EKSPOR TUNGGAL
module.exports = router;