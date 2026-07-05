const express = require('express');
const router = express.Router();
const { getHealth, getInfo, echo } = require('../controllers/healthController');

// Kesehatan Server - GET /health
router.get('/health', getHealth);

// API Routes
router.get('/info', getInfo);
router.get('/echo/:msg', echo);

module.exports = router;