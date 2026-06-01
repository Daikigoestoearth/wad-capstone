const express = require('express');
const router = express.Router();
const { getHealth, getInfo, echo } = require('../controllers/healthController');

// Route Health Check (dipanggil langsung tanpa prefix /api)
router.get('/health', getHealth);

// API Routes dengan handler dari controller
router.get('/info', getInfo);
router.get('/echo/:msg', echo);

module.exports = router;