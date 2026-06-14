// File: src/routes/index.js
const express = require('express');
const router = express.Router();
const { getHealth, getInfo, echo } =
require('../controllers/healthController');

// ─── Kesehatan Server ───────────────────────────────────────
// GET /health — dipanggil di luar prefix /api
router.get('/health', getHealth);

// ─── Root Route ─────────────────────────────────────────────
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to basic-rest-api', docs: '/api/info'
    });
});

// ─── API Routes ─────────────────────────────────────────────
router.get('/info', getInfo);
router.get('/echo/:msg', echo);
module.exports = router;